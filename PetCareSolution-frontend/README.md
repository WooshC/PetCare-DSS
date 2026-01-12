# PetCare Frontend

Aplicación frontend de PetCare Solution construida con React + Vite.

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/PetCareSolution.git
cd PetCareSolution/PetCareSolution-frontend
```

2. Instalar dependencias
```bash
npm install
# o
yarn install
```

## Ejecutar la Aplicación

Para iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecutar ESLint

## Estructura del Proyecto

```
src/
├── assets/        # Recursos estáticos (imágenes, fuentes, etc.)
├── components/    # Componentes reutilizables
├── pages/         # Páginas/vistas de la aplicación
├── services/      # Servicios API y utilidades
├── App.jsx        # Componente raíz
└── main.jsx      # Punto de entrada de la aplicación
```

## Variables de Entorno

Crea un archivo `.env` en el directorio raíz:

```env
VITE_API_URL=tu_url_api_aquí
```

## Compilación para Producción

```bash
npm run build
# o
yarn build
```

Los archivos compilados se almacenarán en el directorio `dist/`.

## Tecnologías Utilizadas

- React 18
- Vite
- React Router Dom
- TailwindCSS
- Lucide Icons

## Cómo Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu función (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.