// Variables y constantes
const NORTE_SUR = 0; // constante para representar el sentido Norte-Sur
const SUR_NORTE = 1; // constante para representar el sentido Sur-Norte
const HORAS_PICO = [6, 11.5, 17]; // horas pico de lunes a viernes
const HORAS_PICO_FDS = [13, 18]; // horas pico de sabado a domingo
const TOPE_FLUJO = 125; // vehiculos por kilometro
const TIEMPO_CAMBIO = 120; // minutos para la descarga de vehiculos
const TIEMPO_COLA_NS = [18, 8]; // minutos por viaje segun el dia de la semana
const TIEMPO_COLA_SN = [6, 0]; // minutos por viaje segun el dia de la semana

// Matriz que almacena los valores de las densidades vehiculares segun el sentido, la hora y el dia
let densidadVehicular = [
  [
    // Sentido Norte-Sur
    [119, 105, 120], // horas pico de lunes a viernes
    [107, 80], // horas pico de sabado a domingo
  ],
  [
    // Sentido Sur-Norte
    [117, 98, 76], // horas pico de lunes a viernes
    [105, 54], // horas pico de sabado a domingo
  ],
];

// Variable global que guarda el estado de la nueva via (sentido actual)
let sentidoActual = NORTE_SUR; // se inicializa con el valor NORTE_SUR o SUR_NORTE segun el caso

// Funcion que calcula el tiempo promedio en cola segun el sentido y la hora
function calcularTiempoCola(sentido, hora, dia) {
  let tiempo = 0;
  let densidad = obtenerDensidadVehicular(sentido, hora, dia); // se llama a la funcion auxiliar que devuelve el valor correspondiente de la matriz densidadVehicular
  if (sentido == NORTE_SUR) {
    tiempo = TIEMPO_COLA_NS[dia < 6 ? 0 : 1]; // se asigna el tiempo segun el dia de la semana (lunes a viernes o sabado a domingo)
  } else if (sentido == SUR_NORTE) {
    tiempo = TIEMPO_COLA_SN[dia < 6 ? 0 : 1]; // se asigna el tiempo segun el dia de la semana (lunes a viernes o sabado a domingo)
  }
  // Si la densidad supera el tope de flujo, se aumenta el tiempo proporcionalmente
  if (densidad > TOPE_FLUJO) {
    tiempo += ((densidad - TOPE_FLUJO) / TOPE_FLUJO) * tiempo;
  }
  return tiempo;
}

// Funcion auxiliar que devuelve el valor correspondiente de la matriz densidadVehicular segun el sentido, la hora y el dia
function obtenerDensidadVehicular(sentido, hora, dia) {
  let indiceHora = -1; // indice para acceder a la columna de la matriz segun la hora
  let indiceDia = dia < 6 ? 0 : 1; // indice para acceder a la fila de la matriz segun el dia (lunes a viernes o sabado a domingo)
  if (dia < 6) {
    // lunes a viernes
    for (let i = 0; i < HORAS_PICO.length; i++) {
      // se recorre el arreglo HORAS_PICO para encontrar el indice correspondiente a la hora actual
      if (hora >= HORAS_PICO[i] && hora < HORAS_PICO[i] + 2.5) {
        // si la hora actual esta dentro del rango de una hora pico
        indiceHora = i; // se asigna el indice encontrado
        break; // se sale del bucle
      }
    }
  } else {
    // sabado a domingo
    for (let i = 0; i < HORAS_PICO_FDS.length; i++) {
      // se recorre el arreglo HORAS_PICO_FDS para encontrar el indice correspondiente a la hora actual
      if (hora >= HORAS_PICO_FDS[i] && hora < HORAS_PICO_FDS[i] + 2) {
        // si la hora actual esta dentro del rango de una hora pico
        indiceHora = i; // se asigna el indice encontrado
        break; // se sale del bucle
      }
    }
  }
  if (indiceHora == -1) {
    // si no se encontro un indice valido para la hora
    return 0; // se devuelve 0 como valor de la densidad
  } else {
    // si se encontro un indice valido para la hora
    return densidadVehicular[sentido][indiceDia][indiceHora]; // se devuelve el valor correspondiente de la matriz densidadVehicular
  }
}

// Funcion que simula el comportamiento de los vehiculos en la nueva via
function simularVehiculos(hora, dia) {
  let vehiculos = 0; // numero de vehiculos que circulan por la nueva via
  let cola = 0; // numero de vehiculos que esperan para entrar a la nueva via
  let tiempoActual = new Date(fechaInicio); // tiempo que transcurre desde el inicio de la simulacion
  let cambio = false; // indica si se ha cambiado el sentido de circulacion
  let densidad = obtenerDensidadVehicular(sentidoActual, hora, dia); // se llama a la funcion auxiliar que devuelve el valor correspondiente de la matriz densidadVehicular
  // Mientras no se supere el tiempo de fin de simulacion
  while (tiempoActual <= fechaFin) {
    // Si hay vehiculos esperando para entrar a la nueva via
    if (cola > 0) {
      // Se verifica si hay espacio disponible en la nueva via
      if (vehiculos < TOPE_FLUJO * 12) {
        // 12 kilometros de longitud
        // Se ingresa un vehiculo a la nueva via y se reduce la cola
        vehiculos++;
        cola--;
      }
    }
    // Si hay vehiculos circulando por la nueva via
    if (vehiculos > 0) {
      // Se verifica si algun vehiculo ha llegado al final de la nueva via
      if (Math.random() < 0.1) {
        // probabilidad del 10%
        // Se retira un vehiculo de la nueva via
        vehiculos--;
      }
    }
    // Si no se ha cambiado el sentido de circulacion
    if (!cambio) {
      // Se verifica si se ha alcanzado el tiempo de cambio
      if (tiempoActual - fechaInicio >= TIEMPO_CAMBIO * 60000) {
        // se multiplica por 60000 para convertir minutos en milisegundos
        // Se cambia el sentido de circulacion y se reinicia el tiempo actual con el valor de fechaInicio
        cambio = true;
        tiempoActual = new Date(fechaInicio);
        sentidoActual = sentidoActual == NORTE_SUR ? SUR_NORTE : NORTE_SUR;
      }
    }
    // Se incrementa el tiempo actual en un minuto
    tiempoActual.setMinutes(tiempoActual.getMinutes() + 1);
    // Se verifica si hay nuevos vehiculos que quieren entrar a la nueva via
    if (Math.random() < densidad / TOPE_FLUJO) {
      // probabilidad proporcional a la densidad
      // Se incrementa la cola en un vehiculo
      cola++;
    }
  }
  // Se retorna el numero de vehiculos que quedaron en cola al finalizar la simulacion
  return cola;
}

// Funcion que evalua el rendimiento de la nueva via comparandola con la via actual
function evaluarRendimiento(hora, dia) {
  let colaActualNS = calcularTiempoCola(NORTE_SUR, hora, dia); // numero de vehiculos en cola en la via actual segun el tiempo promedio para el sentido Norte-Sur
  let colaActualSN = calcularTiempoCola(SUR_NORTE, hora, dia); // numero de vehiculos en cola en la via actual segun el tiempo promedio para el sentido Sur-Norte
  let colaNuevaNS = simularVehiculos(hora, dia); // numero de vehiculos en cola en la nueva via segun la simulacion para el sentido Norte-Sur
  let colaNuevaSN = simularVehiculos(hora, dia); // numero de vehiculos en cola en la nueva via segun la simulacion para el sentido Sur-Norte
  let rendimientoNS = ((colaActualNS - colaNuevaNS) / colaActualNS) * 100; // porcentaje de mejora o empeoramiento del rendimiento para el sentido Norte-Sur
  let rendimientoSN = ((colaActualSN - colaNuevaSN) / colaActualSN) * 100; // porcentaje de mejora o empeoramiento del rendimiento para el sentido Sur-Norte
  return [rendimientoNS, rendimientoSN];
}

// Funcion que calcula el mejor sentido en base al arreglo de rendimiento de los resultados
function calcularMejorSentido(resultadosSimulacion) {
  let contadorNS = 0; // contador para el sentido Norte-Sur
  let contadorSN = 0; // contador para el sentido Sur-Norte
  // Se recorre el arreglo de escenarios del objeto resultadosSimulacion
  for (let i = 0; i < resultadosSimulacion.escenarios.length; i++) {
    // Se obtiene el rendimientoNorteSur y el rendimientoSurNorte del escenario actual
    let rendimientoNS = resultadosSimulacion.escenarios[i].rendimientoNorteSur;
    let rendimientoSN = resultadosSimulacion.escenarios[i].rendimientoSurNorte;
    // Se compara el rendimientoNorteSur y el rendimientoSurNorte
    if (rendimientoNS > rendimientoSN) {
      // Si el rendimientoNorteSur es mayor que el rendimientoSurNorte
      // Se incrementa el contador para el sentido Norte-Sur
      contadorNS++;
    } else if (rendimientoSN > rendimientoNS) {
      // Si el rendimientoSurNorte es mayor que el rendimientoNorteSur
      // Se incrementa el contador para el sentido Sur-Norte
      contadorSN++;
    }
  }
  // Se verifica cuál contador es mayor
  if (contadorNS > contadorSN) {
    // Si el contador para el sentido Norte-Sur es mayor que el contador para el sentido Sur-Norte
    // Se devuelve el sentido Norte-Sur como el mejor sentido
    return NORTE_SUR;
  } else if (contadorSN > contadorNS) {
    // Si el contador para el sentido Sur-Norte es mayor que el contador para el sentido Norte-Sur
    // Se devuelve el sentido Sur-Norte como el mejor sentido
    return SUR_NORTE;
  } else {
    // Si los contadores son iguales
    // Se devuelve null como indicador de que no hay un mejor sentido definido
    return null;
  }
}

// Funcion auxiliar que convierte el valor numerico del sentido en una cadena de texto
function convertirSentido(sentido) {
  if (sentido == NORTE_SUR) {
    return "Norte-Sur";
  } else if (sentido == SUR_NORTE) {
    return "Sur-Norte";
  } else {
    return "No definido";
  }
}

// Funcion que muestra los resultados en el HTML
function mostrarResultados(resultadosSimulacion) {
  // Se llama a la funcion calcularMejorSentido
  let mejorSentido = calcularMejorSentido(resultadosSimulacion);
  // Se usa la funcion auxiliar para convertir el valor numerico del sentido en una cadena de texto
  let mejorSentidoTexto = convertirSentido(mejorSentido);
  // Se muestra el resultado en el HTML con un mensaje adecuado
  if (mejorSentido == null) {
    // Si no hay un mejor sentido definido
    resultadosDiv.innerHTML =
      "<p>No hay un mejor sentido para la nueva vía, ya que ambos sentidos tienen el mismo rendimiento.</p>";
  } else {
    // Si hay un mejor sentido definido
    resultadosDiv.innerHTML =
      "<p>El mejor sentido para la nueva vía es: " + mejorSentidoTexto + "</p>";
  }
}

let form = document.getElementById("form");
let fechaInicioInput = document.getElementById("fechaInicio");
let fechaFinInput = document.getElementById("fechaFin");
let resultadosDiv = document.getElementById("resultados");

// Agrega un evento al formulario para que se ejecute la simulacion al enviarlo
form.addEventListener("submit", function (e) {
  // Evita que se recargue la pagina al enviar el formulario
  e.preventDefault();

  resultadosDiv.innerHTML = "<p>Simulando...</p><progress></progress>";

  setTimeout(function () {
    // Convierte los datos ingresados en objetos Date
    fechaInicio = new Date(fechaInicioInput.value);
    fechaFin = new Date(fechaFinInput.value);

    // Crea un objeto JSON para guardar los resultados de la simulacion
    let resultadosSimulacion = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      escenarios: [],
    };

    // Calcula el numero total de horas entre la fecha de inicio y fin de simulacion
    let duracionSimulacion =
      (fechaFin.getTime() - fechaInicio.getTime()) / 3600000; // se divide por 3600000 para convertir milisegundos en horas

    // Recorre todas las horas y dias entre la fecha de inicio y fin de simulacion
    let fechaActual = new Date(fechaInicio); // fecha actual de la simulacion

    for (let i = 0; i < duracionSimulacion; i++) {
      // Obtiene la hora y el dia de la fecha actual
      let hora = fechaActual.getHours();
      let dia = fechaActual.getDay();

      // Llama a la funcion evaluarRendimiento con los parametros actuales
      let rendimientos = evaluarRendimiento(hora, dia);

      // Guarda el resultado en el arreglo de escenarios del objeto resultadosSimulacion
      resultadosSimulacion.escenarios.push({
        fecha: new Date(fechaActual),
        rendimientoNorteSur: rendimientos[0],
        rendimientoSurNorte: rendimientos[1],
      });

      // Incrementa la fecha actual en una hora
      fechaActual.setHours(fechaInicio.getHours() + i + 1);
    }

    // Muestra los resultados en el HTML
    mostrarResultados(resultadosSimulacion);
  }, 1000);
});
