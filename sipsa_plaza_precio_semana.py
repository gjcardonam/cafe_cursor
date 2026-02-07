#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Consulta SIPSA: productos por plaza y precio para la última semana.

Usa promediosSipsaSemanaMadr (datos semanales por fuente/plaza).
Filtra registros de los últimos 7 días y devuelve producto, plaza y precio
(el servicio devuelve promedioKg = precio promedio por kg en pesos).

Ejecución:
  source .venv/bin/activate
  python sipsa_plaza_precio_semana.py
"""

import json
import logging
import os
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from zeep import Client
from zeep.exceptions import Fault as ZeepFault
from zeep.helpers import serialize_object
from zeep.transports import Transport

WSDL_URL = "https://appweb.dane.gov.co/sipsaWS/SrvSipsaUpraBeanService?WSDL"
WSDL_URL_HTTP = "http://appweb.dane.gov.co/sipsaWS/SrvSipsaUpraBeanService?WSDL"
OPERATION_PLAZA_SEMANA = "promediosSipsaSemanaMadr"
CONNECT_TIMEOUT = 10
READ_TIMEOUT = 120
MAX_RETRIES = 3
BACKOFF_FACTOR = 0.5
OUT_DIR = "out"
DIAS_ULTIMA_SEMANA = 7

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def _json_serializable(obj):
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
    session = requests.Session()
    retry = Retry(
        total=MAX_RETRIES,
        connect=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=(500, 502, 503, 504),
        allowed_methods=frozenset(["GET", "HEAD", "POST", "OPTIONS"]),
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _get_client(wsdl_url: str):
    session = _build_session()
    transport = Transport(
        session=session,
        timeout=CONNECT_TIMEOUT,
        operation_timeout=READ_TIMEOUT,
    )
    return Client(wsdl=wsdl_url, transport=transport)


def _parse_fecha(value) -> datetime | None:
    """Convierte valor a datetime para comparación; devuelve None si no se puede."""
    if value is None:
        return None
    if hasattr(value, "year") and hasattr(value, "month"):
        dt = value
        if getattr(dt, "tzinfo", None) is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    s = str(value).strip()
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        pass
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d/%m/%Y"):
        try:
            part = s[:19] if "T" in s else s[:10]
            return datetime.strptime(part, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def _dentro_ultima_semana(fecha_val) -> bool:
    """True si la fecha cae dentro de los últimos DIAS_ULTIMA_SEMANA días."""
    dt = _parse_fecha(fecha_val)
    if dt is None:
        return False
    if getattr(dt, "tzinfo", None) is None:
        dt = dt.replace(tzinfo=timezone.utc)
    ahora = datetime.now(timezone.utc)
    limite = ahora - timedelta(days=DIAS_ULTIMA_SEMANA)
    return limite <= dt <= ahora + timedelta(days=1)


def _normalize_records(raw_response) -> list[dict]:
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


def _get_plaza(record: dict) -> str:
    for k in ("fuenNombre", "fuenNombre_", "plaza", "Plaza", "fuente"):
        if k in record and record[k] is not None:
            return str(record[k]).strip()
    return ""


def _get_producto(record: dict) -> str:
    for k in ("artiNombre", "producto", "Producto", "artiNombre_"):
        if k in record and record[k] is not None:
            return str(record[k]).strip()
    return ""


def _get_precio_o_valor(record: dict) -> float | None:
    """Precio o valor numérico: precioPromedio, promedioKg, etc."""
    for k in ("precioPromedio", "precio_promedio", "promedioKg", "promedio_kg", "PrecioPromedio"):
        if k in record and record[k] is not None:
            try:
                v = record[k]
                if isinstance(v, (int, float)):
                    return float(v)
                return float(str(v).strip().replace(",", "."))
            except (ValueError, TypeError):
                pass
    return None


def _get_fecha_registro(record: dict):
    for k in ("fechaIni", "enmaFecha", "fechaCaptura", "fechaCreacion", "fecha"):
        if k in record:
            return record[k]
    return None


def main() -> int:
    logger.info("SIPSA productos por plaza y precio - última semana. WSDL: %s", WSDL_URL)

    try:
        client = _get_client(WSDL_URL)
    except Exception as e:
        logger.warning("Falló HTTPS. Intentando HTTP... %s", e)
        try:
            client = _get_client(WSDL_URL_HTTP)
        except Exception as e2:
            logger.error("No se pudo conectar al WSDL: %s", e2)
            return 1

    if not hasattr(client.service, OPERATION_PLAZA_SEMANA):
        logger.error("Operación '%s' no encontrada. Disponibles: %s", OPERATION_PLAZA_SEMANA, dir(client.service))
        return 1

    try:
        logger.info("Llamando a %s()...", OPERATION_PLAZA_SEMANA)
        method = getattr(client.service, OPERATION_PLAZA_SEMANA)
        raw_response = method()
    except ZeepFault as e:
        logger.error("SOAPFault: %s", e.message)
        return 1
    except (requests.RequestException, requests.Timeout) as e:
        logger.error("Error de conexión: %s", e)
        return 1
    except Exception as e:
        logger.exception("Error: %s", e)
        return 1

    all_records = _normalize_records(raw_response)
    logger.info("Total registros recibidos: %s", len(all_records))

    # Filtrar por última semana (por fechaIni, enmaFecha o equivalente)
    ultima_semana = [r for r in all_records if _dentro_ultima_semana(_get_fecha_registro(r))]
    # Si ningún registro tiene fecha en los últimos 7 días, usar los más recientes del set (p. ej. última semana en el servicio)
    if not ultima_semana and all_records:
        fechas_parseadas = []
        for r in all_records:
            f = _parse_fecha(_get_fecha_registro(r))
            if f is not None:
                fechas_parseadas.append((f, r))
        if fechas_parseadas:
            fechas_parseadas.sort(key=lambda x: x[0], reverse=True)
            fecha_mas_reciente = fechas_parseadas[0][0]
            ultima_semana = [r for f, r in fechas_parseadas if (fecha_mas_reciente - f).days <= DIAS_ULTIMA_SEMANA]
        else:
            ultima_semana = all_records[:5000]
    elif not ultima_semana:
        ultima_semana = []

    logger.info("Registros en ventana de última semana: %s", len(ultima_semana))

    # Estructura de salida: producto, plaza, precio (o promedioKg), fecha
    resultado = []
    for r in ultima_semana:
        plaza = _get_plaza(r)
        producto = _get_producto(r)
        precio = _get_precio_o_valor(r)
        fecha = _get_fecha_registro(r)
        fecha_str = _parse_fecha(fecha)
        fecha_str = fecha_str.isoformat() if fecha_str and hasattr(fecha_str, "isoformat") else str(fecha) if fecha else None
        resultado.append({
            "producto": producto,
            "plaza": plaza,
            "precio": precio,
            "precioPromedioKg": r.get("promedioKg"),  # por si el servicio devuelve kg
            "fecha": fecha_str,
            "maximoKg": r.get("maximoKg"),
            "minimoKg": r.get("minimoKg"),
        })

    # Quitar duplicados opcionales: mismo producto+plaza+fecha (dejar uno)
    seen = set()
    unicos = []
    for r in resultado:
        key = (r.get("producto"), r.get("plaza"), r.get("fecha"))
        if key not in seen:
            seen.add(key)
            unicos.append(r)

    # Salida consola
    print()
    print("=== SIPSA: Productos por plaza y precio (última semana) ===")
    print(f"Total registros: {len(unicos)}")
    print()
    # Agrupar por plaza para mostrar
    por_plaza = {}
    for r in unicos:
        p = r.get("plaza") or "Sin plaza"
        por_plaza.setdefault(p, []).append(r)
    for plaza, regs in sorted(por_plaza.items(), key=lambda x: -len(x[1]))[:15]:
        print(f"  Plaza: {plaza} ({len(regs)} registros)")
        for r in regs[:5]:
            precio = r.get("precio") or r.get("precioPromedioKg") or "N/A"
            print(f"    - {r.get('producto')}: {precio}")
        if len(regs) > 5:
            print(f"    ... y {len(regs) - 5} más")
        print()
    print(f"Plazas con datos: {len(por_plaza)}")

    # JSON
    os.makedirs(OUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    out_path = os.path.join(OUT_DIR, f"sipsa_plaza_precio_semana_{timestamp}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(_json_serializable(unicos), f, ensure_ascii=False, indent=2)
    logger.info("JSON guardado: %s", out_path)
    print(f"JSON guardado: {out_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
