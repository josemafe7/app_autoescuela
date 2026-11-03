// Datos de demostración de Autoescuela Faro. Se generan con fechas relativas
// al día de hoy, así siempre hay prácticas de ayer sin cerrar, recordatorios
// para mañana, un hueco libre en la lista de espera y una convocatoria por venir.

import {
  Alumno,
  BaseDatos,
  BLOQUES,
  Cargo,
  EstadoPractica,
  Evaluacion,
  Examen,
  Interesado,
  ListaEspera,
  MANIOBRAS,
  MODELO_IA_POR_DEFECTO,
  Nivel,
  Niveles,
  Pago,
  Practica,
  Tarifa,
  TasaDGT,
  FormaPago,
} from "./tipos";
import { aISO, diaSemana, esDomingo, hoy, sumarDias } from "./fechas";

type ProfId = "p1" | "p2" | "p3";

const TARIFAS: Tarifa[] = [
  { id: "t_matricula", tipo: "matricula", concepto: "Matrícula y curso teórico", precio: 150, practicas: 0, admitePlazos: true },
  { id: "t_suelta", tipo: "suelta", concepto: "Práctica suelta (45 min)", precio: 30, practicas: 1, admitePlazos: false },
  { id: "t_bono10", tipo: "bono", concepto: "Bono de 10 prácticas", precio: 260, practicas: 10, admitePlazos: true },
  { id: "t_bono20", tipo: "bono", concepto: "Bono de 20 prácticas", precio: 500, practicas: 20, admitePlazos: true },
  { id: "t_examen", tipo: "examen", concepto: "Derecho de examen práctico", precio: 50, practicas: 0, admitePlazos: false },
  { id: "t_tasa", tipo: "tasa", concepto: "Tasa de la DGT (2 convocatorias)", precio: 94.05, practicas: 0, admitePlazos: false },
];

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";
const dni = (n: number) => `${String(n).padStart(8, "0")}${LETRAS_DNI[n % 23]}`;

const quitarTildes = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const ORDEN: Nivel[] = ["por_trabajar", "en_progreso", "dominada"];

export function crearDatosDemo(): BaseDatos {
  const H = hoy();
  const ahoraISO = new Date().toISOString();
  const iso = (fecha: string, hora = "10:00") => new Date(`${fecha}T${hora}:00`).toISOString();

  /** n-ésimo día laborable (lunes a sábado) desde hoy: 1 = el siguiente, -1 = el anterior. */
  const diaLab = (n: number) => {
    let f = H;
    let restantes = Math.abs(n);
    const paso = n > 0 ? 1 : -1;
    while (restantes > 0) {
      f = sumarDias(f, paso);
      if (!esDomingo(f)) restantes--;
    }
    return f;
  };

  // Jueves más reciente (al menos 2 días antes de hoy): ahí se celebraron los exámenes.
  let j0 = sumarDias(H, -2);
  while (diaSemana(j0) !== 4) j0 = sumarDias(j0, -1);
  const convFechas = [sumarDias(j0, -42), sumarDias(j0, -28), sumarDias(j0, -14), j0];
  const convFutura = sumarDias(j0, 14);

  // ── Profesores y coches ──
  const profesores = [
    { id: "p1", nombre: "Ana", apellidos: "Morales Bueno", telefono: "611 482 905", cocheId: "c1" },
    { id: "p2", nombre: "Luis", apellidos: "Ortega Salas", telefono: "622 715 340", cocheId: "c2" },
    { id: "p3", nombre: "Marta", apellidos: "Ruiz Aguilar", telefono: "633 208 671", cocheId: "c3" },
  ];
  const coches = [
    { id: "c1", matricula: "4821 LMK", modelo: "Seat Ibiza", esReserva: false },
    { id: "c2", matricula: "7350 MBR", modelo: "Renault Clio", esReserva: false },
    { id: "c3", matricula: "1946 MFT", modelo: "Volkswagen Polo", esReserva: false },
    { id: "c4", matricula: "5512 KZD", modelo: "Seat Ibiza", esReserva: true },
  ];
  const incidencias = [
    { id: "inc1", cocheId: "c2", tipo: "taller" as const, desde: diaLab(3), hasta: diaLab(4), nota: "Cambio de embrague" },
    { id: "inc2", cocheId: "c3", tipo: "itv" as const, desde: sumarDias(H, -20), hasta: sumarDias(H, -20), nota: "ITV pasada favorable" },
  ];
  const cocheDe = (prof: ProfId, fecha: string) => {
    const propio = profesores.find((p) => p.id === prof)!.cocheId;
    return incidencias.some((i) => i.cocheId === propio && i.desde <= fecha && fecha <= i.hasta) ? "c4" : propio;
  };

  const alumnos: Alumno[] = [];
  const cargos: Cargo[] = [];
  const pagos: Pago[] = [];
  const tasas: TasaDGT[] = [];
  const examenes: Examen[] = [];
  const practicas: Practica[] = [];
  const evaluaciones: Evaluacion[] = [];
  let cont = 0;
  const id = (p: string) => `${p}${String(++cont).padStart(4, "0")}`;

  const formas: FormaPago[] = ["bizum", "tarjeta", "efectivo"];
  const comprar = (
    alumnoId: string,
    tarifaId: string,
    fecha: string,
    pagado: "todo" | "plazo1" | "nada" = "todo",
  ) => {
    const t = TARIFAS.find((x) => x.id === tarifaId)!;
    const cargo: Cargo = {
      id: id("cg"),
      alumnoId,
      tipo: "compra",
      tarifaId,
      tipoTarifa: t.tipo,
      concepto: t.concepto,
      importe: t.precio,
      practicas: t.practicas,
      plazos: pagado === "plazo1" ? 2 : 1,
      fecha: iso(fecha),
    };
    cargos.push(cargo);
    const forma = formas[cont % 3];
    if (pagado === "todo") {
      pagos.push({ id: id("pg"), alumnoId, cargoId: cargo.id, importe: t.precio, forma, fecha: iso(fecha), plazo: 1 });
    } else if (pagado === "plazo1") {
      pagos.push({ id: id("pg"), alumnoId, cargoId: cargo.id, importe: Math.round((t.precio / 2) * 100) / 100, forma, fecha: iso(fecha), plazo: 1 });
    }
    if (t.tipo === "tasa" && pagado === "todo") {
      tasas.push({ id: id("tx"), alumnoId, cargoId: cargo.id, fechaPago: fecha });
    }
    return cargo;
  };
  const tasaDe = (alumnoId: string) => tasas.filter((t) => t.alumnoId === alumnoId).at(-1)?.id ?? null;

  // ── Agenda: reparto de horas sin solapes ──
  const ocupado = new Set<string>();
  const clave = (prof: string, fecha: string, hora: string) => `${prof}|${fecha}|${hora}`;
  const colocar = (prof: ProfId, fecha: string, preferida?: string): string => {
    if (preferida && !ocupado.has(clave(prof, fecha, preferida))) {
      ocupado.add(clave(prof, fecha, preferida));
      return preferida;
    }
    const libre = BLOQUES.find((b) => !ocupado.has(clave(prof, fecha, b)));
    if (!libre) throw new Error(`Sin hueco para ${prof} el ${fecha}`);
    ocupado.add(clave(prof, fecha, libre));
    return libre;
  };
  const nuevaPractica = (
    alumnoId: string,
    prof: ProfId,
    fecha: string,
    inicio: string,
    estado: EstadoPractica,
    extra: Partial<Practica> = {},
  ): Practica => {
    const p: Practica = {
      id: id("pr"),
      alumnoId,
      profesorId: prof,
      cocheId: cocheDe(prof, fecha),
      fecha,
      inicio,
      estado,
      confirmada: estado !== "reservada",
      sinSaldo: false,
      origen: "alumno",
      creadaEl: iso(sumarDias(fecha, -4)),
      ...extra,
    };
    practicas.push(p);
    return p;
  };

  // ── Alumnos ──
  interface Spec {
    id: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    fase: Alumno["fase"];
    prof?: ProfId;
    compras?: [string, "todo" | "plazo1" | "nada"][];
    disponibles?: number;
    futuras?: number;
    perdidas?: EstadoPractica[];
    sinCerrar?: string;
    extraReservas?: number;
    final?: Partial<Niveles>;
    finalBase?: Nivel;
    ultimaGrave?: boolean;
    verdeHace?: number | string;
    teorico?: { matrHace: number; ultimoHace: number | null; tests: number; fallos: number | null; aprobadoHace?: number | string };
    listaEspera?: ListaEspera;
    notas?: string;
  }

  const todos = [1, 2, 3, 4, 5, 6];
  const specs: Spec[] = [
    // Teórico
    { id: "a01", nombre: "Pablo", apellidos: "Jiménez Soto", telefono: "644 102 377", fase: "teorico", teorico: { matrHace: 20, ultimoHace: 2, tests: 34, fallos: 4.2 } },
    { id: "a02", nombre: "Irene", apellidos: "Castillo Peña", telefono: "655 913 248", fase: "teorico", teorico: { matrHace: 30, ultimoHace: 9, tests: 12, fallos: 7.8 } },
    { id: "a03", nombre: "Hugo", apellidos: "Romero Vílchez", telefono: "666 470 815", fase: "teorico", teorico: { matrHace: 40, ultimoHace: 15, tests: 5, fallos: 11.2 }, notas: "Pagó la matrícula en dos plazos." },
    { id: "a04", nombre: "Carmen", apellidos: "Vega Lozano", telefono: "677 384 902", fase: "teorico", teorico: { matrHace: 10, ultimoHace: null, tests: 0, fallos: null }, notas: "Vino por la web (clase de prueba)." },
    { id: "a05", nombre: "Daniel", apellidos: "Torres Ariza", telefono: "688 251 639", fase: "teorico", teorico: { matrHace: 35, ultimoHace: 1, tests: 58, fallos: 1.8 }, notas: "Listo para presentarse al teórico." },
    { id: "a06", nombre: "Alba", apellidos: "Moreno Cuesta", telefono: "699 527 104", fase: "teorico", teorico: { matrHace: 50, ultimoHace: 3, tests: 41, fallos: 3.4 } },
    // Esperando prácticas (cola 1)
    { id: "a07", nombre: "Mario", apellidos: "Gil Carrasco", telefono: "610 845 296", fase: "espera_practicas", teorico: { matrHace: 75, ultimoHace: 28, tests: 62, fallos: 1.6, aprobadoHace: 27 } },
    { id: "a08", nombre: "Nerea", apellidos: "Santos Rivas", telefono: "620 391 784", fase: "espera_practicas", compras: [["t_bono10", "todo"]], teorico: { matrHace: 66, ultimoHace: 20, tests: 48, fallos: 2.2, aprobadoHace: 19 }, notas: "Ya ha comprado su bono de 10." },
    { id: "a09", nombre: "Adrián", apellidos: "León Ferrer", telefono: "630 672 913", fase: "espera_practicas", teorico: { matrHace: 58, ultimoHace: 11, tests: 55, fallos: 2.0, aprobadoHace: 10 } },
    { id: "a10", nombre: "Claudia", apellidos: "Prieto Navas", telefono: "640 118 457", fase: "espera_practicas", teorico: { matrHace: 49, ultimoHace: 6, tests: 39, fallos: 2.6, aprobadoHace: 5 } },
    // Prácticas con Ana
    { id: "a11", nombre: "Lucía", apellidos: "Fernández Rojas", telefono: "650 734 218", fase: "practicas", prof: "p1", compras: [["t_bono20", "todo"]], disponibles: 7, futuras: 2, sinCerrar: "09:30", final: { rotondas_dos_carriles: "por_trabajar", aparcamiento_linea: "en_progreso" } },
    { id: "a12", nombre: "Javier", apellidos: "Ramos Ortiz", telefono: "660 285 941", fase: "practicas", prof: "p1", compras: [["t_bono10", "todo"]], disponibles: 1, futuras: 0, sinCerrar: "11:00", perdidas: ["cancelada_tarde"], final: { arranque_pendiente: "por_trabajar", circulacion_ciudad: "en_progreso", autovia: "por_trabajar", zonas_examen: "por_trabajar" }, notas: "Le llamamos Javi. Se pone nervioso." },
    { id: "a13", nombre: "Sara", apellidos: "Domínguez Luque", telefono: "670 952 306", fase: "practicas", prof: "p1", compras: [["t_bono20", "todo"], ["t_bono10", "todo"]], disponibles: 3, futuras: 2, sinCerrar: "10:15", final: { aparcamiento_linea: "en_progreso" } },
    { id: "a14", nombre: "Marcos", apellidos: "Herrera Gálvez", telefono: "680 417 652", fase: "practicas", prof: "p1", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"]], disponibles: 2, futuras: 3, verdeHace: 53 },
    { id: "a15", nombre: "Elena", apellidos: "Rubio Campos", telefono: "690 863 175", fase: "practicas", prof: "p1", compras: [["t_bono10", "todo"]], disponibles: 0, futuras: 0, extraReservas: 1, final: { rotondas_dos_carriles: "en_progreso", aparcamiento_linea: "por_trabajar", autovia: "en_progreso", zonas_examen: "por_trabajar" }, notas: "Secretaría le reservó una práctica sin saldo; paga el martes." },
    { id: "a16", nombre: "Óscar", apellidos: "Molina Reina", telefono: "612 539 480", fase: "practicas", prof: "p1", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"], ["t_examen", "todo"]], disponibles: 2, futuras: 0, verdeHace: 80, notas: "Dos suspensos en el práctico: necesita tasa nueva." },
    { id: "a17", nombre: "Paula", apellidos: "Ortiz Mena", telefono: "623 186 027", fase: "practicas", prof: "p1", compras: [["t_bono10", "plazo1"]], disponibles: 6, futuras: 1, final: { incorporaciones: "en_progreso", rotondas_dos_carriles: "por_trabajar", cambios_carril: "en_progreso", aparcamiento_linea: "por_trabajar", aparcamiento_bateria: "en_progreso", autovia: "por_trabajar", zonas_examen: "por_trabajar" }, listaEspera: { dias: todos, franjas: ["manana", "tarde"], desde: iso(sumarDias(H, -12)) } },
    // Prácticas con Luis
    { id: "a18", nombre: "Raúl", apellidos: "Cano Espinosa", telefono: "634 720 591", fase: "practicas", prof: "p2", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"]], disponibles: 1, futuras: 3, verdeHace: 66 },
    { id: "a19", nombre: "Marina", apellidos: "Delgado Fuentes", telefono: "645 391 862", fase: "practicas", prof: "p2", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"], ["t_examen", "todo"]], disponibles: 4, futuras: 4, verdeHace: "j0", notas: "Suspendió el último práctico por una prioridad." },
    { id: "a20", nombre: "Sergio", apellidos: "Pastor Linares", telefono: "656 248 713", fase: "practicas", prof: "p2", compras: [["t_bono20", "todo"], ["t_bono10", "todo"]], disponibles: 3, futuras: 3, verdeHace: 30, notas: "Falta que pague el derecho de examen." },
    { id: "a21", nombre: "Laura", apellidos: "Iglesias Barrio", telefono: "667 805 349", fase: "practicas", prof: "p2", compras: [["t_bono20", "todo"]], disponibles: 5, futuras: 3, final: { autovia: "en_progreso", zonas_examen: "en_progreso" }, listaEspera: { dias: [1, 3, 5], franjas: ["manana"], desde: iso(sumarDias(H, -20)) } },
    { id: "a22", nombre: "Iván", apellidos: "Serrano Mata", telefono: "678 563 120", fase: "practicas", prof: "p2", compras: [["t_bono10", "todo"]], disponibles: 4, futuras: 1, sinCerrar: "09:30", perdidas: ["no_presentado"], final: { incorporaciones: "en_progreso", rotondas: "en_progreso", rotondas_dos_carriles: "por_trabajar", cambios_carril: "por_trabajar", arranque_pendiente: "en_progreso", aparcamiento_linea: "por_trabajar", aparcamiento_bateria: "por_trabajar", autovia: "por_trabajar", zonas_examen: "por_trabajar" }, listaEspera: { dias: todos, franjas: ["tarde"], desde: iso(sumarDias(H, -6)) } },
    { id: "a23", nombre: "Noelia", apellidos: "Cabrera Díaz", telefono: "689 104 538", fase: "practicas", prof: "p2", compras: [["t_bono10", "todo"]], disponibles: 0, futuras: 0, final: { rotondas_dos_carriles: "en_progreso", aparcamiento_linea: "en_progreso", autovia: "por_trabajar", zonas_examen: "por_trabajar" } },
    // Prácticas con Marta
    { id: "a24", nombre: "Álvaro", apellidos: "Medina Toro", telefono: "613 876 254", fase: "practicas", prof: "p3", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"]], disponibles: 2, futuras: 1, extraReservas: 1, verdeHace: 24, teorico: { matrHace: 800, ultimoHace: 700, tests: 70, fallos: 1.4, aprobadoHace: "caduca" }, notas: "Su aprobado del teórico caduca pronto." },
    { id: "a25", nombre: "Cristina", apellidos: "Gallego Sanz", telefono: "624 517 930", fase: "practicas", prof: "p3", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"]], disponibles: 4, futuras: 2, extraReservas: 1, verdeHace: 20, ultimaGrave: true, final: { prioridades_peatones: "en_progreso" } },
    { id: "a26", nombre: "Rubén", apellidos: "Vidal Ocaña", telefono: "635 249 618", fase: "practicas", prof: "p3", compras: [["t_bono20", "todo"]], disponibles: 8, futuras: 3, final: { rotondas_dos_carriles: "en_progreso", zonas_examen: "por_trabajar" }, listaEspera: { dias: todos, franjas: ["manana"], desde: iso(sumarDias(H, -9)) } },
    { id: "a27", nombre: "Sofía", apellidos: "Méndez Prados", telefono: "646 932 470", fase: "practicas", prof: "p3", compras: [["t_bono10", "todo"]], disponibles: 2, futuras: 1, final: { rotondas_dos_carriles: "por_trabajar", cambios_carril: "en_progreso", aparcamiento_linea: "en_progreso", autovia: "por_trabajar", zonas_examen: "por_trabajar" } },
    { id: "a28", nombre: "Jorge", apellidos: "Calvo Robles", telefono: "657 605 183", fase: "practicas", prof: "p3", compras: [["t_bono20", "plazo1"]], disponibles: 15, futuras: 2, finalBase: "por_trabajar", final: { incorporaciones: "en_progreso", prioridades_peatones: "en_progreso", circulacion_ciudad: "en_progreso" } },
    // Aprobados
    { id: "a29", nombre: "Andrea", apellidos: "Peña Morillas", telefono: "668 371 925", fase: "aprobado", prof: "p2", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"]], disponibles: 0, futuras: 0, verdeHace: 40 },
    { id: "a30", nombre: "Tomás", apellidos: "Reyes Alarcón", telefono: "679 280 614", fase: "aprobado", prof: "p3", compras: [["t_bono20", "todo"], ["t_bono10", "todo"], ["t_bono10", "todo"], ["t_examen", "todo"], ["t_examen", "todo"]], disponibles: 0, futuras: 0, verdeHace: 70 },
  ];

  const fechaVerde = (v: number | string | undefined) =>
    v === undefined ? null : v === "j0" ? j0 : sumarDias(H, -(v as number));

  // Plan de futuras: días laborables en los que cae cada reserva.
  const indicePorProf: Record<string, number> = {};

  for (const s of specs) {
    const conPracticas = s.fase === "practicas" || s.fase === "aprobado";
    const compras = s.compras ?? [];
    const practicasCompradas = compras.reduce((sum, [t]) => sum + TARIFAS.find((x) => x.id === t)!.practicas, 0);
    const perdidas = s.perdidas ?? [];
    const futuras = s.futuras ?? 0;
    const sinCerrar = s.sinCerrar ? 1 : 0;
    // Reservas que se crean aparte (práctica sin saldo de Elena, clases junto al hueco de Marta).
    const extra = s.extraReservas ?? 0;
    // La práctica sin saldo de Elena suma 1 al monedero (y queda como deuda).
    const sinSaldo = s.id === "a15" ? 1 : 0;
    const realizadas = conPracticas
      ? practicasCompradas + sinSaldo - (s.disponibles ?? 0) - futuras - extra - sinCerrar - perdidas.length
      : 0;
    const idx = s.prof ? (indicePorProf[s.prof] = (indicePorProf[s.prof] ?? -1) + 1) : 0;

    // Historial de prácticas pasadas: de la más reciente hacia atrás, cada 2 días laborables.
    // Los plantones y cancelaciones tardías caen a mitad del historial.
    const pasadas: { fecha: string; estado: EstadoPractica }[] = [];
    const total = realizadas + perdidas.length;
    const mitad = Math.floor(total / 2);
    for (let k = 0; k < total; k++) {
      const fecha = diaLab(-(2 + k * 2 + (idx % 2)));
      const estado: EstadoPractica =
        k >= mitad && k < mitad + perdidas.length ? perdidas[k - mitad] : "realizada";
      pasadas.push({ fecha, estado });
    }
    pasadas.reverse(); // de la más antigua a la más reciente

    const primera = pasadas[0]?.fecha;
    const t = s.teorico;
    let aprobadoTeorico: string | null = null;
    if (t?.aprobadoHace === "caduca") {
      const cad = sumarDias(H, 7);
      aprobadoTeorico = `${Number(cad.slice(0, 4)) - 2}${cad.slice(4)}`;
    } else if (typeof t?.aprobadoHace === "number") {
      aprobadoTeorico = sumarDias(H, -t.aprobadoHace);
    } else if (conPracticas) {
      aprobadoTeorico = sumarDias(primera ?? H, -9);
    }
    const fechaMatricula = t ? sumarDias(H, -t.matrHace) : sumarDias(aprobadoTeorico ?? H, -48);
    const verdeDesde = fechaVerde(s.verdeHace);

    const alumno: Alumno = {
      id: s.id,
      nombre: s.nombre,
      apellidos: s.apellidos,
      dni: dni(23_000_000 + Number(s.id.slice(1)) * 1_734_517),
      telefono: s.telefono,
      email: `${quitarTildes(s.nombre)}.${quitarTildes(s.apellidos.split(" ")[0])}@correo.es`,
      fechaMatricula,
      fase: s.fase,
      profesorId: s.prof ?? null,
      teorico: {
        ultimoTest: t ? (t.ultimoHace === null ? null : sumarDias(H, -t.ultimoHace)) : sumarDias(aprobadoTeorico ?? H, -1),
        numTests: t?.tests ?? 45 + (Number(s.id.slice(1)) % 20),
        mediaFallos: t ? t.fallos : 1.5 + (Number(s.id.slice(1)) % 10) / 10,
        aprobadoEl: aprobadoTeorico,
      },
      verdeDesde: s.fase === "practicas" ? verdeDesde : null,
      avisoRetroceso: s.id === "a25",
      listaEspera: s.listaEspera ?? null,
      aprobadoEl: null,
      notas: s.notas ?? "",
    };
    alumnos.push(alumno);

    // Cargos: matrícula y tasa al matricularse; bonos y derechos después.
    comprar(s.id, "t_matricula", fechaMatricula, s.id === "a03" ? "plazo1" : "todo");
    if (s.id !== "a04") comprar(s.id, "t_tasa", sumarDias(fechaMatricula, 2));
    compras.forEach(([tarifa, modo], i) => {
      const base = tarifa === "t_examen" ? (verdeDesde ?? H) : (primera ?? sumarDias(H, -3));
      let fecha = sumarDias(base, tarifa === "t_examen" ? -6 + i : -2 + i * 9);
      if (fecha > H) fecha = sumarDias(H, -1);
      comprar(s.id, tarifa, fecha, modo);
    });

    // Examen teórico
    if (aprobadoTeorico) {
      examenes.push({ id: id("ex"), alumnoId: s.id, tipo: "teorico", fecha: aprobadoTeorico, resultado: "apto", tasaId: tasaDe(s.id) });
    }
    if (s.id === "a06") {
      examenes.push({ id: id("ex"), alumnoId: s.id, tipo: "teorico", fecha: sumarDias(H, -12), resultado: "no_apto", tasaId: tasaDe(s.id) });
    }

    if (!conPracticas || !s.prof) continue;
    const prof = s.prof;

    // Niveles finales y evaluaciones progresivas
    const base: Nivel = s.finalBase ?? "dominada";
    const final = Object.fromEntries(MANIOBRAS.map((m) => [m.id, s.final?.[m.id] ?? base])) as Niveles;
    const totalReal = pasadas.filter((p) => p.estado === "realizada").length;
    let k = 0;
    for (const p of pasadas) {
      const inicio = colocar(prof, p.fecha);
      const practica = nuevaPractica(s.id, prof, p.fecha, inicio, p.estado);
      if (p.estado !== "realizada") {
        if (p.estado === "cancelada_tarde") ocupado.delete(clave(prof, p.fecha, inicio));
        continue;
      }
      const avance = totalReal <= 1 ? 1 : k / (totalReal - 1);
      const niveles = Object.fromEntries(
        MANIOBRAS.map((m, mi) => {
          const objetivo = ORDEN.indexOf(final[m.id]);
          const t2 = avance - mi * 0.025;
          const idx = t2 >= 0.85 ? objetivo : t2 >= 0.35 ? Math.min(objetivo, 1) : 0;
          return [m.id, ORDEN[k === totalReal - 1 ? objetivo : idx]];
        }),
      ) as Niveles;
      const esUltima = k === totalReal - 1;
      const grave = esUltima ? !!s.ultimaGrave : avance < 0.6 && k % 5 === 2;
      evaluaciones.push(crearEvaluacion(practica, niveles, grave, s.nombre, esUltima, id("ev")));
      k++;
    }

    // Práctica de ayer sin cerrar
    if (s.sinCerrar) {
      const fecha = diaLab(-1);
      nuevaPractica(s.id, prof, fecha, colocar(prof, fecha, s.sinCerrar), "reservada", { confirmada: true });
    }

    // Reservas futuras
    for (let f = 0; f < futuras; f++) {
      const fecha = diaLab(1 + ((idx * 2 + f * 3) % 9));
      nuevaPractica(s.id, prof, fecha, colocar(prof, fecha), "reservada", {
        confirmada: false,
        creadaEl: iso(sumarDias(H, -2)),
      });
    }

    if (s.fase === "aprobado") alumno.profesorId = prof;
  }

  // ── Situaciones especiales ──
  const al = (aid: string) => alumnos.find((a) => a.id === aid)!;

  // Elena: secretaría le asignó una práctica sin saldo (queda como deuda).
  {
    const fecha = diaLab(2);
    const p = nuevaPractica("a15", "p1", fecha, colocar("p1", fecha), "reservada", {
      sinSaldo: true,
      origen: "secretaria",
      creadaEl: iso(sumarDias(H, -1)),
    });
    const t = TARIFAS.find((x) => x.id === "t_suelta")!;
    cargos.push({
      id: id("cg"), alumnoId: "a15", tipo: "practica_sin_saldo", tarifaId: t.id, tipoTarifa: t.tipo,
      concepto: "Práctica asignada sin saldo", importe: t.precio, practicas: 1, plazos: 1,
      fecha: iso(sumarDias(H, -1)), practicaId: p.id,
    });
  }

  // Marta, pasado mañana: Sofía canceló con tiempo y el hueco queda entre dos clases.
  const ofertas: BaseDatos["ofertas"] = [];
  {
    const fecha = diaLab(2);
    for (const h of ["08:00", "08:45", "09:30"]) ocupado.delete(clave("p3", fecha, h));
    practicas
      .filter((p) => p.profesorId === "p3" && p.fecha === fecha && ["08:00", "08:45", "09:30"].includes(p.inicio))
      .forEach((p) => {
        const libre = BLOQUES.find((b) => !ocupado.has(clave("p3", fecha, b)) && !["08:00", "08:45", "09:30"].includes(b))!;
        ocupado.add(clave("p3", fecha, libre));
        p.inicio = libre;
      });
    nuevaPractica("a25", "p3", fecha, colocar("p3", fecha, "08:00"), "reservada", { confirmada: false });
    nuevaPractica("a24", "p3", fecha, colocar("p3", fecha, "09:30"), "reservada", { confirmada: false });
    const cancelada = nuevaPractica("a27", "p3", fecha, "08:45", "cancelada", {
      canceladaEl: iso(sumarDias(H, -1), "19:40"),
    });
    ofertas.push({
      id: id("of"), practicaOrigenId: cancelada.id, profesorId: "p3", fecha, inicio: "08:45",
      creadaEl: cancelada.canceladaEl!, ofrecidaA: ["a26"], estado: "abierta",
    });
  }
  // Huecos rellenados la semana pasada por el caza-huecos.
  const rellenado = (quien: string, origenAlumno: string, prof: ProfId, horaCancelacion: string) => {
    const suya = practicas
      .filter((p) => p.alumnoId === quien && p.estado === "realizada")
      .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    if (!suya) return;
    suya.origen = "caza_huecos";
    const origen = nuevaPractica(origenAlumno, prof, suya.fecha, suya.inicio, "cancelada", {
      canceladaEl: iso(sumarDias(suya.fecha, -2), horaCancelacion),
      creadaEl: iso(sumarDias(suya.fecha, -6)),
    });
    ofertas.push({
      id: id("of"), practicaOrigenId: origen.id, profesorId: prof, fecha: suya.fecha, inicio: suya.inicio,
      creadaEl: origen.canceladaEl!, ofrecidaA: [quien], estado: "cogida", cogidaPor: quien,
      cogidaEl: new Date(new Date(origen.canceladaEl!).getTime() + 7 * 60_000).toISOString(),
      practicaNuevaId: suya.id,
    });
  };
  rellenado("a21", "a22", "p2", "18:20");
  rellenado("a17", "a11", "p1", "12:05");

  // ── Convocatorias pasadas y futura ──
  const convocatorias: BaseDatos["convocatorias"] = [];
  const plazasPasadas: [string, string, "apto" | "no_apto"][][] = [
    [["a30", "p3", "no_apto"]],
    [["a30", "p3", "apto"], ["a16", "p1", "no_apto"]],
    [["a29", "p2", "apto"]],
    [["a16", "p1", "no_apto"], ["a19", "p2", "no_apto"]],
  ];
  const cupos = [3, 4, 3, 4];
  convFechas.forEach((fecha, i) => {
    const conv = {
      id: id("cv"), fecha, cupo: cupos[i], confirmada: true, creadaEl: iso(sumarDias(fecha, -12)),
      plazas: plazasPasadas[i].map(([alumnoId, , resultado]) => ({ alumnoId, resultado })),
    };
    convocatorias.push(conv);
    for (const [alumnoId, , resultado] of plazasPasadas[i]) {
      examenes.push({ id: id("ex"), alumnoId, tipo: "practico", fecha, resultado, tasaId: tasaDe(alumnoId), convocatoriaId: conv.id });
      if (resultado === "apto") {
        const a = al(alumnoId);
        a.fase = "aprobado";
        a.aprobadoEl = fecha;
        a.verdeDesde = null;
      }
    }
  });
  convocatorias.push({ id: id("cv"), fecha: convFutura, cupo: 3, confirmada: false, creadaEl: iso(sumarDias(H, -1)), plazas: [] });

  // ── Solicitudes de recarga ──
  const solicitudes: BaseDatos["solicitudes"] = [
    { id: id("sr"), alumnoId: "a23", tarifaId: "t_bono10", fecha: iso(sumarDias(H, -1), "21:14"), atendida: false, mensaje: "Me he quedado sin prácticas, ¿puedo pagar el bono por Bizum?" },
    { id: id("sr"), alumnoId: "a12", tarifaId: "t_bono10", fecha: iso(sumarDias(H, -1), "23:40"), atendida: false, mensaje: "" },
    { id: id("sr"), alumnoId: "a21", tarifaId: "t_bono20", fecha: iso(sumarDias(H, -30), "18:02"), atendida: true, mensaje: "" },
  ];

  // ── Interesados de la web ──
  const interesados: Interesado[] = crearInteresados(H, iso);
  al("a04").interesadoId = interesados.find((i) => i.estado === "matriculado")!.id;
  interesados.find((i) => i.estado === "matriculado")!.alumnoId = "a04";

  return {
    version: 1,
    creadaEl: ahoraISO,
    alumnos,
    profesores,
    coches,
    incidencias,
    tarifas: TARIFAS.map((t) => ({ ...t })),
    cargos,
    pagos,
    tasas,
    examenes,
    practicas,
    evaluaciones,
    ofertas,
    convocatorias,
    solicitudes,
    interesados,
    ajustes: { modeloIA: MODELO_IA_POR_DEFECTO },
  };
}

// ── Textos de las evaluaciones de ejemplo ──
function crearEvaluacion(
  practica: Practica,
  niveles: Niveles,
  falloGrave: boolean,
  nombre: string,
  conIA: boolean,
  evId: string,
): Evaluacion {
  const enProgreso = MANIOBRAS.filter((m) => niveles[m.id] === "en_progreso").map((m) => m.nombre.toLowerCase());
  const porTrabajar = MANIOBRAS.filter((m) => niveles[m.id] === "por_trabajar").map((m) => m.nombre.toLowerCase());
  const foco = [...enProgreso, ...porTrabajar].slice(0, 2);
  const lista = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : xs[0]);
  let resumen: string;
  let mensaje: string;
  if (falloGrave) {
    resumen = `Práctica con un fallo grave en una prioridad; ${foco.length ? `sigue pendiente ${lista(foco)}` : "el resto, bien"}.`;
    mensaje = `${nombre}, hoy se nos ha escapado una prioridad: mira siempre a derecha e izquierda antes de entrar. ${foco.length ? `También seguimos con ${lista(foco)}.` : "Lo demás lo llevas muy bien."} ¡A por la siguiente!`;
  } else if (!foco.length) {
    resumen = "Práctica completa sin fallos graves; todas las maniobras dominadas.";
    mensaje = `¡Muy bien, ${nombre}! Hoy lo has hecho todo con seguridad. Seguimos repasando las zonas de examen para llegar con confianza.`;
  } else {
    resumen = `Buena práctica; toca reforzar ${lista(foco)}.`;
    mensaje = `Buen trabajo hoy, ${nombre}. En la próxima nos centramos en ${lista(foco)}: con un par de prácticas más lo tendrás.`;
  }
  return {
    id: evId,
    practicaId: practica.id,
    alumnoId: practica.alumnoId,
    profesorId: practica.profesorId,
    fecha: practica.fecha,
    niveles,
    falloGrave,
    notasDictadas: conIA ? `Hoy ${nombre} ${foco.length ? `bien en general, pero ${lista(foco)} todavía le cuesta` : "lo ha hecho todo bien"}.` : "",
    resumen,
    mensajeAlumno: mensaje,
    conIA,
    creadaEl: new Date(`${practica.fecha}T${practica.inicio}:00`).toISOString(),
  };
}

function crearInteresados(H: string, iso: (f: string, h?: string) => string): Interesado[] {
  const base = (n: number) => sumarDias(H, -n);
  return [
    {
      id: "faro_demo_01", fecha: iso(base(0), "00:12"), origen: "asistente_ia", nombre: "Marta Lozano", telefono: "651 220 984",
      estado: "nuevo", sessionId: "s1",
      conversacion: [
        { role: "user", content: "Hola, ¿cuánto cuesta sacarse el carnet con vosotros?" },
        { role: "assistant", content: "¡Hola! Con 20 prácticas y aprobando a la primera sale por 829,05 € en total: matrícula 150 €, bono de 20 prácticas 500 €, derecho de examen 50 €, tasa de la DGT 94,05 € y psicotécnico unos 35 €. Sin letra pequeña." },
        { role: "user", content: "¿Y se puede pagar a plazos?" },
        { role: "assistant", content: "Sí, la matrícula y los bonos se pueden pagar en dos plazos. ¿Quieres que te llamemos para contártelo? Déjame tu nombre y teléfono." },
        { role: "user", content: "Marta, 651 220 984. Mejor por la tarde." },
        { role: "assistant", content: "¡Perfecto, Marta! Te llamamos por la tarde. Gracias por escribirnos." },
      ],
    },
    {
      id: "faro_demo_02", fecha: iso(base(1), "22:47"), origen: "clase_prueba", nombre: "Diego Carmona", telefono: "662 913 507",
      email: "diego.carmona@correo.es", edad: 19, zona: "Teatinos", experienciaPrevia: "Ninguna", diaPreferido: "Sábado", franjaHoraria: "Mañana",
      estado: "nuevo", notas: "Quiere probar antes de matricularse.",
    },
    {
      id: "faro_demo_03", fecha: iso(base(2), "13:05"), origen: "matricula", nombre: "Lorena Bravo Ruiz", telefono: "673 448 120",
      email: "lorena.bravo@correo.es", dni: "54871236K", edad: 23, zona: "Carretera de Cádiz", packElegido: "Matrícula + bono de 20", modalidadPago: "Dos plazos",
      estado: "contactado", notas: "Llamada el viernes: viene el lunes a firmar.",
    },
    {
      id: "faro_demo_04", fecha: iso(base(3), "21:30"), origen: "asistente_ia", nombre: "Álex Muñoz", telefono: "684 306 772",
      estado: "contactado", sessionId: "s4",
      conversacion: [
        { role: "user", content: "Ya aprobé el teórico en otra autoescuela, ¿me puedo cambiar?" },
        { role: "assistant", content: "Sí, te ayudamos con el traslado del expediente sin coste de gestión. Solo tendrías que comprar las prácticas que necesites." },
        { role: "user", content: "¿Cuánto tardaría en examinarme del práctico?" },
        { role: "assistant", content: "No podemos prometer fechas: en Málaga la espera puede ser de varios meses y las plazas las reparte Tráfico. Lo que sí hacemos es enseñarte tu puesto real en nuestra cola y una fecha aproximada. ¿Te llamamos?" },
        { role: "user", content: "Vale, Álex, 684 306 772" },
      ],
    },
    {
      id: "faro_demo_05", fecha: iso(base(5), "18:15"), origen: "clase_prueba", nombre: "Nuria Sevilla", telefono: "695 117 438",
      edad: 18, zona: "Centro", experienciaPrevia: "Algo con mi padre en un descampado", diaPreferido: "Miércoles", franjaHoraria: "Tarde",
      estado: "clase_prueba", notas: `Clase de prueba con Luis el ${base(-3)} a las 17:30.`,
    },
    {
      id: "faro_demo_06", fecha: iso(base(8), "23:58"), origen: "asistente_ia", nombre: "Interesado en chat", telefono: "",
      estado: "nuevo", sessionId: "s6",
      conversacion: [
        { role: "user", content: "¿Qué papeles necesito para matricularme?" },
        { role: "assistant", content: "DNI o NIE en vigor y el informe del psicotécnico de un centro de reconocimiento de conductores (vale 90 días para presentarte al teórico). La tasa de la DGT la pagamos nosotros en tu nombre." },
        { role: "user", content: "Gracias!" },
      ],
    },
    {
      id: "faro_demo_07", fecha: iso(base(12), "10:40"), origen: "clase_prueba", nombre: "Carmen Vega Lozano", telefono: "677 384 902",
      email: "carmen.vega@correo.es", edad: 20, zona: "El Palo", experienciaPrevia: "Ninguna", diaPreferido: "Lunes", franjaHoraria: "Mañana",
      estado: "matriculado", notas: "Hizo la clase de prueba y se matriculó.",
    },
    {
      id: "faro_demo_08", fecha: iso(base(4), "16:22"), origen: "matricula", nombre: "Samuel Herrero", telefono: "616 559 203",
      email: "samuel.herrero@correo.es", dni: "79215634T", edad: 27, zona: "Ciudad Jardín", packElegido: "Matrícula + bono de 10", modalidadPago: "Un pago",
      estado: "nuevo", notas: "Tiene el psicotécnico hecho desde hace un mes.",
    },
  ];
}

export { aISO };
