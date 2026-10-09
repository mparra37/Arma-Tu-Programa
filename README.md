# Arma el programa

Práctica de programación para TC1037 Pensamiento Algorítmico: el alumno ordena
líneas de código Python revueltas y les da la sangría correcta.

Es un sitio estático (HTML, CSS y JavaScript, sin dependencias). Funciona en
computadora, tablet y celular.

## Cómo lo usa el alumno

1. En la página de inicio lee las instrucciones y escribe su nombre y matrícula.
2. Resuelve los problemas. El tiempo solo cuenta mientras la práctica está en
   pantalla: se detiene en la página de inicio y con la pestaña oculta.
3. Al terminar todos aparece el resultado con su nombre, matrícula, tiempo,
   número de revisiones y fecha, para tomarle captura y subirla a Canvas.

En un dispositivo compartido, el siguiente alumno entra a **Inicio** y presiona
**Empezar de cero** para borrar los datos del anterior.

## Publicarlo con GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta
   (`index.html` debe quedar en la raíz).
2. En el repositorio entra a **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. La liga queda como `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

## Agregar o cambiar problemas

Todos los problemas están en `problemas.js`. Cada uno se escribe como código
Python normal; la sangría de 4 espacios es parte de la respuesta.

```js
{
  tema: "Declarar y llamar funciones",
  titulo: "Mi primera función",
  descripcion: "Declara la función area_rectangulo y después úsala...",
  ejecucion: "15",
  codigo: [
    "def area_rectangulo(base, altura):",
    "    area = base * altura",
    "    return area",
    "resultado = area_rectangulo(5, 3)",
    "print(resultado)",
  ],
  distractores: ["    print(area)"],   // opcional: líneas que sobran
  observa: "Comentario que aparece al resolverlo.",   // opcional
}
```

Cuando varias partes pueden ir en cualquier orden (dos funciones, dos líneas
independientes), agrúpalas con `libre`. Cada parte es una línea o un arreglo de
líneas que deben ir juntas:

```js
codigo: [
  {
    libre: [
      ["def descuento(precio):", "    return precio * 0.9"],
      ["def main():", "    precio = 100", "    print(descuento(precio))"],
    ],
  },
  "main()",
],
```

Notas:

- Cada vez que cambies `problemas.js`, `app.js` o `estilos.css`, sube el número
  de `?v=` en las tres referencias de `index.html`. Así el navegador de los
  alumnos no mezcla archivos viejos (en caché) con los nuevos.

- El título identifica el avance guardado de cada alumno; no repitas títulos.
- El nombre, la matrícula, el avance y el tiempo se guardan en el navegador del
  alumno (no se envían a ningún lado). Por lo mismo, el resultado no es
  infalsificable: es un comprobante de buena fe.
- Si cambias la lista de problemas, quien ya había terminado tendrá que
  resolver los nuevos para volver a ver su resultado.
- Un distractor no debe ser igual a una línea de la solución.
