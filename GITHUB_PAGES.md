# Publicar en GitHub Pages

El proyecto está listo para publicarse en GitHub Pages. Solo tienes que habilitar la opción en el repositorio.

## Pasos

1. **Sube el repositorio a GitHub** (si aún no está).
2. **Habilita GitHub Pages con GitHub Actions:**
   - Ve a **Settings** del repositorio.
   - En el menú izquierdo: **Pages**.
   - En **Build and deployment** > **Source**, elige **GitHub Actions**.
3. **Listo.** En cada push a la rama `main` se ejecutará el workflow *Deploy to GitHub Pages* y se publicará la app.

La URL quedará: `https://<tu-usuario>.github.io/<nombre-del-repo>/`

---

**Nota:** El workflow construye la app en `sabor-de-plaza/` y usa el nombre del repositorio como base, así que la ruta de los recursos se genera correctamente en GitHub Pages.
