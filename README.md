# Generador de Horarios Escolares

Aplicación web local para seleccionar materias y encontrar todas las combinaciones de grupos que no presentan empalmes. No requiere backend, base de datos, cuenta, API externa ni conexión permanente a internet.

## Objetivo

Elegir exactamente un grupo por cada materia marcada, incorporar todas las sesiones semanales de ese grupo y mostrar únicamente los horarios completos que sean compatibles.

## Tecnologías

- React
- Vite
- JavaScript
- CSS
- Vitest

## Requisitos

- Node.js 20 o superior recomendado
- npm

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

Vite mostrará la dirección local que debe abrirse en el navegador, normalmente `http://localhost:5173`.

## Pruebas

```bash
npm run test
```

## Construcción para producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/`. Se pueden revisar localmente con `npm run preview`.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` publica automáticamente la aplicación cuando se envían cambios a `main`.

En GitHub, abre `Settings > Pages` y selecciona `GitHub Actions` en `Build and deployment > Source`. Después de enviar los cambios, el sitio quedará disponible en:

```text
https://angixs-zz.github.io/SelectorHorarios/
```

El nombre `/SelectorHorarios/` también está configurado en `vite.config.js`. Si el repositorio cambia de nombre, hay que actualizar esa ruta.

## Instalación en el teléfono

La aplicación es una PWA y puede instalarse desde su dirección de GitHub Pages. En Android, abre el menú del navegador y elige `Instalar aplicación` o `Añadir a pantalla principal`. En iPhone, abre la página en Safari, pulsa `Compartir` y elige `Añadir a pantalla de inicio`.

Una vez abierta al menos una vez con conexión, sus recursos principales quedan disponibles para volver a usarla sin conexión. Los datos creados en la aplicación siguen guardándose localmente en ese navegador y dispositivo.

## Estructura principal

```text
src/
  components/   Componentes de selección, estadísticas y horarios
  data/         Catálogo inicial de materias y grupos
  services/     Generador de horarios por backtracking
  styles/       Estilos globales y responsivos
  tests/        Pruebas unitarias
  utils/        Funciones puras de tiempo, conflictos y cálculos
  App.jsx       Estado y composición principal
  main.jsx      Punto de entrada de React
```

## Algoritmo

El generador usa backtracking con poda. Recorre las materias seleccionadas y prueba un grupo completo de cada una. Antes de avanzar comprueba todas las sesiones del grupo candidato contra las ya elegidas. Si encuentra un traslape en el mismo día, descarta esa rama de inmediato; no construye todas las combinaciones para filtrarlas al final.

Las horas `HH:mm` se convierten a minutos y se usa la condición `inicioA < finB && inicioB < finA`. Por ello, dos clases consecutivas son válidas. Las combinaciones teóricas se obtienen multiplicando la cantidad de grupos de las materias seleccionadas.

## Datos iniciales

Las materias y sus grupos se encuentran en:

```text
src/data/materiasIniciales.js
```

El modelo separa `semestreCurricular` de la etiqueta administrativa del grupo. Por ejemplo, Sistemas Programables puede tener `semestreCurricular: 7` y conservar el grupo publicado `8SA` con `semestreAdministrativo: 8`.

El bloque curricular de 7.º está formado por `SCD1016`, `SCD1004`, `ACA0909`, `AEB1055`, `SCG1009`, `SCC1023` y `DAD-2605`. La última se conserva sin grupo, horario, docente, aula ni créditos hasta que esos datos sean confirmados.

El bloque curricular de 8.º contiene las claves únicas `SCC1019`, `SCA1002`, `DAD-2601`, `SESSC10`, `DAD-2602` y `ACA0910`. Las materias sin oferta confirmada se mantienen sin inventar grupos, horarios, docentes, aulas o créditos.

Cada grupo tiene un `estado` (`oficial` o `provisional`). Los docentes y aulas desconocidos se guardan como `null`; la interfaz los presenta como datos por confirmar. La oferta publicada de `DSED2302` se conserva con `alcance: 'oferta-administrativa-existente'` porque no está confirmada para alumnos de nuevo ingreso a la especialidad.

La entrada `especialidad-toma-decisiones-provisional` centraliza tres opciones de grupo alternativas: `08:00-09:00`, `10:00-11:00` y `19:00-20:00`. El generador elige solo una opción, no coloca las tres horas en el mismo horario. No se inventan etiquetas administrativas, docentes ni aulas. Para simular choques se usan provisionalmente los días de lunes a viernes; ese supuesto puede editarse cuando coordinación confirme los días definitivos.

Los datos marcados como provisionales sirven para generar horarios, pero producen una advertencia visible en la cuadrícula, el resumen comparativo y el PDF. Verifica siempre el resultado con la publicación escolar antes de inscribirte.

## Primera etapa

Esta versión incluye selección de materias, cálculo de créditos y combinaciones, generación con detección de empalmes, estadísticas, navegación, comparación de hasta cuatro horarios, cuadrícula semanal, resumen, tema claro/oscuro persistente y pruebas unitarias.

## Próximas etapas

Las siguientes funciones quedan fuera de esta primera versión y requieren revisión previa: administración de materias y grupos, importación de fuentes, exportación, favoritos y posibles mejoras para grandes volúmenes de combinaciones como un Web Worker.
