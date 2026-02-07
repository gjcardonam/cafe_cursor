import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En GitHub Pages la app se sirve en https://usuario.github.io/NOMBRE_REPO/
// GITHUB_REPOSITORY en Actions es "usuario/nombre-repo"
const base =
  process.env.GITHUB_REPOSITORY != null
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/'

export default defineConfig({
  base,
  plugins: [react()],
})
