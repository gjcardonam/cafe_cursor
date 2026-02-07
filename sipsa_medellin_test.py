#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MVP: Consulta WebService SIPSA (DANE) para Medellín.

Instrucciones de ejecución:
  python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
  pip install -r requirements.txt
  python sipsa_medellin_test.py
"""

import json
import logging
import os
import sys
from datetime import datetime
from decimal import Decimal
from unicodedata import normalize as unicode_normalize

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from zeep import Client
from zeep.exceptions import Fault as ZeepFault
from zeep.helpers import serialize_object
from zeep.transports import Transport

# -----------------------------------------------------------------------------
# Constantes
# -----------------------------------------------------------------------------
# WSDL oficial DANE (documentación: servicio web para consulta de la base de datos de SIPSA)
# Si falla, obtener URL en: https://www.dane.gov.co/index.php/estadisticas-por-tema/agropecuario/sistema-de-informacion-de-precios-sipsa/servicio-web-para-consulta-de-la-base-de-datos-de-sipsa
WSDL_URL = "https://appweb.dane.gov.co/sipsaWS/SrvSipsaUpraBeanService?WSDL"
# Fallback HTTP por si HTTPS no está disponible
WSDL_URL_HTTP = "http://appweb.dane.gov.co/sipsaWS/SrvSipsaUpraBeanService?WSDL"

OPERATION_CANDIDATE = "promediosSipsaCiudad"
CONNECT_TIMEOUT = 10
READ_TIMEOUT = 30
MAX_RETRIES = 3
BACKOFF_FACTOR = 0.5
OUT_DIR = "out"
MEDELLIN_NORMALIZED = "medellin"  # comparación sin acento y case-insensitive

# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def _normalize_ciudad(s: str) -> str:
    """Normaliza string para comparación case-insensitive y sin acentos."""
    if s is None:
        return ""
    s = str(s).strip()
    # NFD y quitar marcas de combinación para comparar sin acentos
    nfd = unicode_normalize("NFD", s)
    ascii_only = "".join(c for c in nfd if ord(c) < 0x80 or not (0x0300 <= ord(c) <= 0x036F))
    return ascii_only.lower()


def _is_medellin(ciudad_value) -> bool:
    """True si el valor del campo ciudad corresponde a Medellín (case-insensitive, con/sin acento)."""
    return _normalize_ciudad(ciudad_value) == MEDELLIN_NORMALIZED


def _get_ciudad_key(record: dict) -> str | None:
    """Obtiene el valor del campo ciudad del registro (prueba varias claves)."""
    for key in ("ciudad", "Ciudad", "CIUDAD"):
        if key in record and record[key] is not None:
            return record[key]
    return None


def _safe_float(value, default=None):
    """Convierte a float; si falla devuelve default."""
    if value is None:
        return default
    try:
        if isinstance(value, (int, float)):
            return float(value)
        s = str(value).strip().replace(",", ".")
        return float(s) if s else default
    except (ValueError, TypeError):
        return default


def _parse_fecha_captura(value) -> str | None:
    """Devuelve el valor como string para comparación; si es datetime, ISO string."""
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value).strip() or None


def _json_serializable(obj):
    """Convierte recursivamente obj a tipos serializables por json (Decimal -> float, datetime -> str)."""
    if obj is None:
        return None
    if isinstance(obj, Decimal):
        return float(obj)
    if hasattr(obj, "isoformat") and hasattr(obj, "year"):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_json_serializable(v) for v in obj]
    return obj


def _build_session():
    """Session con timeouts y retries (incluye POST para SOAP)."""
    session = requests.Session()
    retry = Retry(
        total=MAX_RETRIES,
        connect=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=(500, 502, 503, 504),
        allowed_methods=frozenset(["GET", "HEAD", "POST", "OPTIONS"]),  # POST para SOAP
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _get_client(wsdl_url: str):
    """Cliente Zeep con transport (timeout connect=10s, operation=30s). Servicio DANE documentado como SOAP 1.2; binding se toma del WSDL."""
    session = _build_session()
    transport = Transport(
        session=session,
        timeout=CONNECT_TIMEOUT,
        operation_timeout=READ_TIMEOUT,
    )
    return Client(wsdl=wsdl_url, transport=transport)


def _resolve_operation_name(client: Client) -> str:
    """Encuentra el nombre real de la operación promediosSipsaCiudad (o el más cercano)."""
    binding = client.service._binding
    ops = list(binding._operations.keys())
    target = OPERATION_CANDIDATE.lower()
    for name in ops:
        if name.lower() == target:
            return name
    for name in ops:
        if "promedios" in name.lower() and "ciudad" in name.lower():
            return name
    if ops:
        logger.warning("Operación '%s' no encontrada; operaciones disponibles: %s", OPERATION_CANDIDATE, ops)
    return OPERATION_CANDIDATE


def _list_services_and_operations(client: Client) -> None:
    """Imprime servicios y operaciones del WSDL."""
    logger.info("WSDL cargado. Servicios: %s", client.wsdl.services)
    for svc in client.wsdl.services.values():
        for port in svc.ports.values():
            binding = port.binding
            if binding:
                ops = list(binding._operations.keys())
                logger.info("Port %s -> operaciones: %s", port.name, ops)


def _print_operation_signature(client: Client, operation_name: str) -> None:
    """Imprime la firma (signature) del método si existe."""
    try:
        binding = client.service._binding
        if operation_name in binding._operations:
            op = binding._operations[operation_name]
            logger.info("Firma operación '%s': %s", operation_name, op)
        else:
            logger.info("Operación '%s' no encontrada en binding; operaciones: %s", operation_name, list(binding._operations.keys()))
    except Exception as e:
        logger.warning("No se pudo obtener firma de '%s': %s", operation_name, e)


def _normalize_records(raw_response) -> list[dict]:
    """Convierte la respuesta Zeep a lista de dicts serializables."""
    if raw_response is None:
        return []
    records = []
    try:
        iterable = list(raw_response) if not isinstance(raw_response, list) else raw_response
    except TypeError:
        iterable = [raw_response]
    for item in iterable:
        try:
            records.append(serialize_object(item))
        except Exception:
            if hasattr(item, "__dict__"):
                records.append(dict(item))
            else:
                records.append({"raw": str(item)})
    return records


def _filter_medellin(records: list[dict]) -> list[dict]:
    """Filtra registros donde ciudad sea Medellín (case-insensitive, con/sin acento)."""
    out = []
    for r in records:
        if not isinstance(r, dict):
            continue
        ciudad = _get_ciudad_key(r)
        if _is_medellin(ciudad):
            out.append(r)
    return out


def _sort_by_precio(records: list[dict], key_precio: str = "precioPromedio") -> list[dict]:
    """Ordena por precioPromedio ascendente; valores no numéricos al final."""
    def sort_key(r):
        v = r.get(key_precio) or r.get("precioPromedio") or r.get("PrecioPromedio")
        f = _safe_float(v)
        if f is None:
            return (1, 0.0)  # al final
        return (0, f)

    return sorted(records, key=sort_key)


def _latest_fecha_captura(records: list[dict]) -> str | None:
    """Obtiene la fechaCaptura más reciente (como string)."""
    fechas = []
    for r in records:
        v = r.get("fechaCaptura") or r.get("FechaCaptura") or r.get("FECHACAPTURA")
        s = _parse_fecha_captura(v)
        if s:
            fechas.append(s)
    return max(fechas) if fechas else None


def main() -> int:
    logger.info("Inicio MVP SIPSA Medellín. WSDL: %s", WSDL_URL)

    # Resolver WSDL: intentar HTTPS primero, luego HTTP
    wsdl_to_use = WSDL_URL
    try:
        client = _get_client(wsdl_to_use)
    except Exception as e:
        logger.warning("Falló HTTPS (%s). Intentando HTTP...", e)
        wsdl_to_use = WSDL_URL_HTTP
        try:
            client = _get_client(wsdl_to_use)
        except Exception as e2:
            logger.error(
                "No se pudo conectar al WSDL. Verifique red y URL. "
                "Obtener WSDL en: https://www.dane.gov.co/index.php/estadisticas-por-tema/agropecuario/sistema-de-informacion-de-precios-sipsa/servicio-web-para-consulta-de-la-base-de-datos-de-sipsa "
                "La dirección del WSDL es: http://appweb.dane.gov.co/sipsaWS/SrvSipsaUpraBeanService?WSDL"
            )
            logger.error("Error: %s", e2)
            return 1

    logger.info("Cliente Zeep creado con WSDL: %s", wsdl_to_use)

    # Introspección
    _list_services_and_operations(client)
    operation_name = _resolve_operation_name(client)
    _print_operation_signature(client, operation_name)

    # Llamada al servicio
    try:
        logger.info("Llamando a %s()...", operation_name)
        method = getattr(client.service, operation_name)
        raw_response = method()
    except ZeepFault as e:
        logger.error("SOAPFault del servicio: %s", e.message)
        logger.error("Código: %s. Detalle: %s", getattr(e, "code", ""), getattr(e, "detail", ""))
        return 1
    except (requests.RequestException, requests.Timeout) as e:
        logger.error("Error de conexión o timeout: %s. Verifique URL y red.", e)
        return 1
    except Exception as e:
        logger.exception("Error inesperado al llamar al servicio: %s", e)
        return 1

    # Normalizar respuesta a list[dict]
    all_records = _normalize_records(raw_response)
    logger.info("Total registros recibidos (todas las ciudades): %s", len(all_records))

    # Filtrar por Medellín
    medellin_records = _filter_medellin(all_records)
    logger.info("Registros filtrados para Medellín: %s", len(medellin_records))

    # Ordenar por precio
    sorted_by_precio = _sort_by_precio(medellin_records)
    top_20_baratos = sorted_by_precio[:20]
    top_20_caros = sorted_by_precio[-20:][::-1]

    # Fecha más reciente
    latest_fecha = _latest_fecha_captura(medellin_records)

    # Salida consola
    print()
    print("=== SIPSA Medellín ===")
    print(f"Total registros para Medellín: {len(medellin_records)}")
    print()
    print("Top 20 productos más baratos (precioPromedio):")
    for i, r in enumerate(top_20_baratos, 1):
        precio = r.get("precioPromedio") or r.get("PrecioPromedio") or r.get("precio_promedio", "N/A")
        producto = r.get("producto") or r.get("Producto") or r.get("producto", "N/A")
        print(f"  {i:2}. {producto}: {precio}")
    print()
    print("Top 20 productos más caros (precioPromedio):")
    for i, r in enumerate(top_20_caros, 1):
        precio = r.get("precioPromedio") or r.get("PrecioPromedio") or r.get("precio_promedio", "N/A")
        producto = r.get("producto") or r.get("Producto") or r.get("producto", "N/A")
        print(f"  {i:2}. {producto}: {precio}")
    print()
    print(f"fechaCaptura más reciente: {latest_fecha or 'N/A'}")
    print()

    # Crear out/ y guardar JSON
    os.makedirs(OUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    out_path = os.path.join(OUT_DIR, f"sipsa_medellin_{timestamp}.json")
    serializable = _json_serializable(medellin_records)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(serializable, f, ensure_ascii=False, indent=2)
    logger.info("JSON guardado en: %s", out_path)
    print(f"JSON guardado en: {out_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
