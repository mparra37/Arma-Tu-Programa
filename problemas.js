// Problemas de práctica.
//
// Cada problema se escribe como código Python normal: la sangría (4 espacios)
// es parte de la respuesta.
//
//   tema          grupo al que pertenece (solo se muestra como etiqueta)
//   titulo        nombre corto del problema
//   descripcion   lo que debe hacer el programa
//   ejecucion     ejemplo de ejecución (lo que se ve en pantalla)
//   codigo        líneas de la solución, en orden.
//                 { libre: [...] } agrupa partes que pueden ir en cualquier
//                 orden; cada parte es una línea o un arreglo de líneas.
//   distractores  líneas que sobran (opcional)
//   observa       comentario que aparece al resolverlo (opcional)

const PROBLEMAS = [
  {
    tema: "Programas secuenciales",
    titulo: "Área de un círculo",
    descripcion:
      "El programa pide el radio de un círculo y muestra su área con dos decimales.",
    ejecucion: "Radio en cm: 5\nArea = 78.54 cm2",
    codigo: [
      "import math",
      'radio = float(input("Radio en cm: "))',
      "area = math.pi * radio ** 2",
      'print(f"Area = {area:.2f} cm2")',
    ],
    distractores: ["area = math.pi() * radio ** 2"],
    observa:
      "math.pi es una constante, no una función: se escribe sin paréntesis.",
  },
  {
    tema: "Programas secuenciales",
    titulo: "Cajas para empacar",
    descripcion:
      "En cada caja caben 12 piezas. El programa pide cuántas piezas hay y muestra cuántas cajas se necesitan para que ninguna pieza se quede fuera.",
    ejecucion: "Piezas: 50\nCajas necesarias: 5",
    codigo: [
      "import math",
      'piezas = int(input("Piezas: "))',
      "cajas = math.ceil(piezas / 12)",
      'print("Cajas necesarias:", cajas)',
    ],
    distractores: ["cajas = math.floor(piezas / 12)"],
    observa:
      "50 / 12 da 4.17. math.ceil() sube a 5; math.floor() bajaría a 4 y dejaría 2 piezas sin caja.",
  },
  {
    tema: "Declarar y llamar funciones",
    titulo: "Mi primera función",
    descripcion:
      "Declara la función area_rectangulo y después úsala para calcular el área de un rectángulo de 5 por 3.",
    ejecucion: "15",
    codigo: [
      "def area_rectangulo(base, altura):",
      "    area = base * altura",
      "    return area",
      "resultado = area_rectangulo(5, 3)",
      "print(resultado)",
    ],
    observa:
      "La sangría indica qué líneas forman el cuerpo de la función. La llamada va sin sangría, después de la declaración.",
  },
  {
    tema: "Declarar y llamar funciones",
    titulo: "Sumar dos áreas",
    descripcion:
      "El programa suma el área de un cuadrado de lado 3 y el área de un cuadrado de lado 4.",
    ejecucion: "25",
    codigo: [
      "def area_cuadrado(lado):",
      "    return lado ** 2",
      "total = area_cuadrado(3) + area_cuadrado(4)",
      "print(total)",
    ],
    distractores: ["    print(lado ** 2)"],
    observa:
      "Para seguir calculando con el resultado, la función debe entregarlo con return. Con print() devolvería None y la suma fallaría.",
  },
  {
    tema: "Declarar y llamar funciones",
    titulo: "El orden de los argumentos",
    descripcion:
      "Un auto recorre 150 km en 2 horas. El programa muestra su velocidad en km/h.",
    ejecucion: "75.0",
    codigo: [
      "def velocidad(distancia, tiempo):",
      "    return distancia / tiempo",
      "print(velocidad(150, 2))",
    ],
    distractores: ["print(velocidad(2, 150))"],
    observa:
      "Los argumentos se asignan en orden: el primero a distancia y el segundo a tiempo. Con velocidad(2, 150) Python no marca error, pero el resultado es incorrecto.",
  },
  {
    tema: "Declarar y llamar funciones",
    titulo: "Distancia entre dos puntos",
    descripcion:
      "La función distancia recibe las coordenadas de dos puntos y devuelve la distancia entre ellos. El programa la prueba con los puntos (0, 0) y (3, 4).",
    ejecucion: "5.0",
    codigo: [
      "import math",
      "def distancia(x1, y1, x2, y2):",
      { libre: ["    dx = x2 - x1", "    dy = y2 - y1"] },
      "    return math.sqrt(dx ** 2 + dy ** 2)",
      "print(distancia(0, 0, 3, 4))",
    ],
    distractores: ["    return math.sqrt(dx + dy) ** 2"],
  },
  {
    tema: "Varias funciones y main()",
    titulo: "Una función que usa otra",
    descripcion:
      "El volumen de un cilindro es el área de su base circular por su altura. El programa muestra el volumen de un cilindro de radio 1 y altura 2.",
    ejecucion: "6.28",
    codigo: [
      "import math",
      {
        libre: [
          ["def area_circulo(radio):", "    return math.pi * radio ** 2"],
          [
            "def volumen_cilindro(radio, altura):",
            "    return area_circulo(radio) * altura",
          ],
        ],
      },
      'print(f"{volumen_cilindro(1, 2):.2f}")',
    ],
    observa:
      "Divide y vencerás: volumen_cilindro() no repite la fórmula del círculo, llama a area_circulo().",
  },
  {
    tema: "Varias funciones y main()",
    titulo: "De Celsius a Fahrenheit",
    descripcion:
      "La función hace la conversión; main() pide el dato, llama a la función y muestra el resultado.",
    ejecucion: "Grados Celsius: 25\n25.0 C = 77.0 F",
    codigo: [
      {
        libre: [
          [
            "def celsius_a_fahrenheit(celsius):",
            "    return celsius * 9 / 5 + 32",
          ],
          [
            "def main():",
            '    celsius = float(input("Grados Celsius: "))',
            "    fahrenheit = celsius_a_fahrenheit(celsius)",
            '    print(f"{celsius} C = {fahrenheit} F")',
          ],
        ],
      },
      "main()",
    ],
    distractores: ["main"],
    observa:
      "Declarar main() no la ejecuta. La última línea, main(), es la que pone todo en marcha; sin paréntesis no se llama.",
  },
  {
    tema: "Varias funciones y main()",
    titulo: "El precio con descuento",
    descripcion:
      "La función descuento devuelve el precio con 10 % de descuento. main() muestra el precio original y el precio final.",
    ejecucion: "100 90.0",
    codigo: [
      {
        libre: [
          ["def descuento(precio):", "    return precio * 0.9"],
          [
            "def main():",
            "    precio = 100",
            "    final = descuento(precio)",
            "    print(precio, final)",
          ],
        ],
      },
      "main()",
    ],
    distractores: ["    descuento(precio)"],
    observa:
      "El precio de main() no cambia: la función trabaja con su propia copia. El valor que devuelve hay que guardarlo, aquí en final.",
  },
  {
    tema: "Varias funciones y main()",
    titulo: "Calcular y mostrar",
    descripcion:
      "Una función calcula el área de un triángulo, otra muestra un resultado con su nombre y main() las combina.",
    ejecucion: "Area: 12.00",
    codigo: [
      {
        libre: [
          ["def area_triangulo(base, altura):", "    return base * altura / 2"],
          [
            "def mostrar_resultado(nombre, valor):",
            '    print(f"{nombre}: {valor:.2f}")',
          ],
          [
            "def main():",
            "    area = area_triangulo(6, 4)",
            '    mostrar_resultado("Area", area)',
          ],
        ],
      },
      "main()",
    ],
    observa: "Regla práctica: si calcula, return. Si muestra, print().",
  },
  {
    tema: "Varias funciones y main()",
    titulo: "Promedio de tres calificaciones",
    descripcion:
      "La función promedio recibe tres calificaciones y devuelve su promedio. main() pide los datos y muestra el resultado con un decimal.",
    ejecucion:
      "Calificacion 1: 8\nCalificacion 2: 9\nCalificacion 3: 10\nPromedio: 9.0",
    codigo: [
      {
        libre: [
          [
            "def promedio(a, b, c):",
            "    suma = a + b + c",
            "    return suma / 3",
          ],
          [
            "def main():",
            '    a = float(input("Calificacion 1: "))',
            '    b = float(input("Calificacion 2: "))',
            '    c = float(input("Calificacion 3: "))',
            "    resultado = promedio(a, b, c)",
            '    print(f"Promedio: {resultado:.1f}")',
          ],
        ],
      },
      "main()",
    ],
    distractores: ["    print(suma / 3)"],
  },
];
