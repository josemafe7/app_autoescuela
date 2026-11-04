# Especificación

Qué se construye. Sirve para comprobar, sin saber programar, que lo construido hace lo que tiene que hacer.

**Estado:** aprobada el 3 de noviembre de 2026. Escrita a partir de la app que ya funcionaba, al cambiar
Supabase por una base de datos local y revisar la seguridad, y ajustada con la revisión independiente de la
fase 1.

## Qué problema resuelve y para quién

Autoescuela Faro es una autoescuela de Málaga (permiso B) inventada para el curso. Resuelve los problemas
del informe del sector:

- **Captar alumnos sin letra pequeña:** web con precios claros, calculadora del coste real, asistente que
  contesta a cualquier hora y formularios de clase de prueba y matrícula que llegan solos a Secretaría.
- **Cobros y prácticas «fiadas»:** monedero de prácticas prepagadas, pagos en dos plazos, deudas y
  solicitudes de recarga.
- **Alumnos parados y colas:** aviso de 7 días sin hacer test, cola para empezar prácticas, cola de examen
  con propuesta automática para cada convocatoria y fecha aproximada para el alumno.
- **Agenda:** reservas sin huecos muertos, cancelación con 24 horas, recordatorio con confirmación,
  plantones, caza-huecos con lista de espera y coche de reserva.
- **Evaluación por voz:** el profesor dicta cómo ha ido la práctica y la IA la convierte en una evaluación.

Es una demo: funciona en local, con datos inventados, para enseñarla y para que cualquiera la descargue.

## Qué hace

Cada línea es una regla que se puede comprobar: «Cuando pasa esto, la app hace esto otro».

### Web pública

- La web tiene inicio, «Cómo funciona», «Precios y calculadora» y «Contacto y matrícula».
- La calculadora suma el coste real con las tarifas oficiales (matrícula 150 €, práctica suelta 30 €, bono
  de 10 prácticas 260 €, bono de 20 prácticas 500 €, derecho de examen 50 € y tasa de la DGT 94,05 €) y el
  psicotécnico, unos 35 €: con 20 prácticas y aprobando a la primera, 829,05 €. Elige la combinación de
  bonos más barata y, si se marca, suma lo que costaría suspender una vez.
- Cuando alguien pide una clase de prueba (nombre, teléfono, edad entre 17 y 85, zona, experiencia, día y
  franja), se guarda como interesado «nuevo» y aparece en la gestión, en Interesados.
- Cuando alguien se matricula online (nombre, DNI o NIE válido, con su letra correcta, correo, teléfono,
  pack y forma de pago), se guarda igual, con el pack y la forma de pago en texto legible.
- Si un dato no es válido (un teléfono con menos de 9 cifras, un DNI con la letra equivocada…), el
  formulario dice cuál y no se guarda nada.
- Desde una misma conexión (IP) se aceptan como mucho 10 solicitudes por hora, y 100 por hora entre todas.
- El asistente contesta solo con la ficha de la autoescuela (`web/data/info-autoescuela-faro.md`): no da
  otros precios, no promete fechas de examen ni porcentajes de aprobados y, si no sabe algo, ofrece que
  llamen.
- Si alguien le pide al asistente que cambie sus reglas o actúe como otra cosa, no lo hace.
- Sin clave de IA, o si la IA falla, el asistente contesta con respuestas fijas sacadas de la ficha.
- Cuando la persona deja su teléfono en el chat (escrito o con el formulario del chat), se guarda como
  interesado con la conversación. Una misma conversación actualiza su contacto en vez de duplicarlo, sin
  quitarle el estado ni las notas que le haya puesto Secretaría. Si el teléfono del formulario del chat no
  vale, el chat lo dice.
- Desde una misma IP se guardan como mucho 10 contactos nuevos por hora desde el chat (100 entre todas);
  actualizar el de la misma conversación no cuenta. Si ya no puede guardarlo, el asistente no dice que lo
  ha anotado y da el teléfono de la autoescuela.
- Cada conversación admite 10 preguntas; cada IP, 30 mensajes cada 10 minutos; y entre todas las personas,
  300 respuestas de la IA por hora (después contesta la ficha, sin gastar saldo).
- La lista de interesados no se puede consultar desde la web.

### Acceso a la gestión

- Se entra con correo y contraseña, y cada perfil va a su portal: Secretaría, profesor o alumno.
- Con datos incorrectos aparece «Correo o contraseña incorrectos», sin decir cuál de los dos falla.
- Tras 5 intentos fallidos con un mismo correo, o 20 desde una misma IP, en 15 minutos, no deja intentarlo
  más hasta que pasan. Entrar bien no cuenta como intento.
- La sesión dura 7 días o hasta que se cierra.
- Quien abre una pantalla de otro perfil vuelve a la suya; sin sesión, vuelve al acceso.

### Secretaría

- «Hoy» resume el día: agenda de los tres profesores, prácticas sin cerrar, recargas pedidas, alumnos con
  7 días o más sin hacer test, convocatorias por confirmar y alumnos que han bajado de verde.
- Da de alta alumnos (nombre, apellidos, teléfono de al menos 9 cifras, DNI o NIE válido con su letra
  correcta y correo, estos dos opcionales). No admite un DNI ni un correo que ya tenga otra persona.
- Un alumno con correo puede entrar en su portal; si se le cambia el correo, entra con el nuevo.
- Registra el progreso del teórico y el examen teórico. Para registrar el examen hace falta la tasa de la
  DGT pagada y convocatorias disponibles; con apto, el alumno pasa a la cola de prácticas.
- La cola de prácticas va por orden de aprobado del teórico. Al asignar profesor, el alumno empieza las
  prácticas. Si cambia de profesor, sus reservas que aún no han empezado pasan al nuevo (las que chocan con
  otra clase se anulan y vuelven al monedero); las ya dadas y sin cerrar se quedan con quien las dio.
- Reserva prácticas en cualquier hora libre. A un alumno sin saldo, solo si marca «Asignar sin saldo», y
  queda una deuda de 30 €.
- Registra pagos de cualquier tarifa, en un plazo o en dos (solo matrícula y bonos). Las prácticas de un
  bono entran en el monedero con el primer pago. Cobra lo pendiente y atiende o archiva las solicitudes
  de recarga.
- Cada tasa de la DGT da 2 convocatorias y cada suspenso gasta una; con las dos gastadas hace falta otra
  tasa.
- Crea convocatorias de examen práctico (de hoy en adelante, con un cupo de 1 a 20). La app propone a los
  primeros de la cola que cumplen los requisitos: convocatorias disponibles, teórico en vigor (dura 2 años)
  y derecho de examen pagado. Secretaría confirma (como mucho, tantos alumnos como el cupo), y el día del
  examen o después registra los resultados: apto termina el carnet y anula sus reservas posteriores; no
  apto vuelve al final de la cola, detrás de todos los que estén en ella al registrar el resultado.
- Cuando un alumno en verde baja de nivel, Secretaría decide si sigue en la cola o sale de ella.
- Registra incidencias de los coches (taller o ITV): las prácticas de esos días pasan al coche de reserva.
- Cambia el precio (entre 0,01 € y 5.000 €) y el nombre de las tarifas; solo afecta a los pagos nuevos.
- Ve los interesados de la web, les cambia el estado, apunta notas y los convierte en alumnos.
- En Ajustes ve si la clave de la IA está puesta (solo sus 4 últimos caracteres) y elige el modelo de la
  evaluación por voz.

### Profesores

- «Mi día» enseña sus prácticas del día y las que tiene sin cerrar.
- Cierra cada práctica: o la evalúa (nivel de las 11 maniobras, si hubo fallo grave, un resumen para la
  ficha y un mensaje para el alumno) o marca que el alumno no se presentó, y entonces se descuenta del
  monedero.
- Puede dictar o escribir sus notas y la IA propone la evaluación; el profesor la revisa antes de guardar.
  Sin clave de IA, la rellena a mano.
- El semáforo del alumno: verde con todas las maniobras dominadas y las 2 últimas prácticas sin fallos
  graves; ámbar si le faltan 1 o 2, o si falta la segunda práctica limpia; rojo en el resto. Al pasar a
  verde con el teórico aprobado, entra en la cola de examen.
- «Mis alumnos» enseña solo los suyos.

### Alumnos

- El inicio enseña sus próximas prácticas, el recordatorio para confirmar las de hoy y mañana, y los huecos
  que le ofrecen.
- Reserva hasta 14 días vista, de lunes a sábado, sin dejar huecos muertos en la agenda de su profesor:
  si el turno (mañana o tarde) está vacío, solo la primera hora del turno; si ya hay clases, las horas
  pegadas a ellas y la primera y la última del turno. Hace falta tener profesor y prácticas en el monedero.
- Cancela: con más de 24 horas, la práctica vuelve al monedero y el hueco queda libre para la lista de
  espera; con menos, se descuenta.
- Se apunta a la lista de espera con sus días y franjas. Cuando alguien cancela, Secretaría ve el hueco en
  «Hoy» con los alumnos de la lista de espera de ese profesor que encajan, y decide si les avisa. Los
  avisados lo ven en su inicio y responden «Sí, la quiero» o «No, gracias»; Secretaría ve qué ha dicho cada
  uno. El primero que dice que sí, se lo queda. 2 horas antes, el hueco se ofrece a todos sus alumnos,
  aunque no se haya avisado.
- Ve su progreso, su puesto en la cola de examen con una fecha aproximada, sus pagos y deudas, y pide
  recargas a Secretaría.

### Datos de la demo

- La web y la gestión guardan en la misma base de datos: lo que llega por la web lo ve Secretaría al
  momento.
- La primera vez que se abre la gestión se cargan los datos de ejemplo, con fechas alrededor de ese día.
  Si la web ya había guardado algún contacto, se conserva.
- `pnpm seed` deja la demo como recién instalada (también borra los contactos de la web y cierra las
  sesiones).

## Quién puede hacer qué

Lo que no aparece aquí no está permitido.

- **Visitante de la web:** ver la web, usar la calculadora y el asistente, y enviar los formularios. No
  puede ver ningún dato guardado.
- **Alumno:** ver solo lo suyo; reservar, confirmar y cancelar sus prácticas; apuntarse a la lista de
  espera y aceptar o rechazar los huecos que le ofrecen; pedir recargas.
- **Profesor:** ver su agenda y a sus alumnos; evaluar sus prácticas (también con la IA) y marcar plantones
  en ellas.
- **Secretaría:** todo lo de la gestión: alumnos, agenda, cobros, colas, convocatorias, coches, tarifas,
  interesados y modelo de la IA. También cerrar cualquier práctica y, al cancelar, decidir si se devuelve,
  y avisar de un hueco liberado a la lista de espera.
- **Nadie** ve ni cambia la clave de la IA desde la app.

## Qué datos maneja

- **Alumnos:** nombre, DNI, teléfono, correo, progreso, pagos y evaluaciones. Personales.
- **Interesados de la web:** nombre, teléfono, correo, DNI, edad, zona y la conversación con el asistente.
  Personales.
- **Pagos y deudas:** importes y forma de pago (Bizum, tarjeta o efectivo). No hay datos de tarjetas.
- **Cuentas:** correo, rol y la contraseña cifrada; de las sesiones solo se guarda una huella del token.
- Todo vive en `datos/faro.db`, en el ordenador donde se arranca, y no se sube a Git. En la demo todos los
  datos son inventados.
- Al usar la IA salen hacia OpenRouter la conversación del asistente (lo que escribe la persona) y las
  notas dictadas con el nombre de pila del alumno.

## Qué queda fuera

- Las facturas: se siguen haciendo en el programa homologado de la autoescuela.
- Cobrar online: los pagos se registran a mano.
- Enviar mensajes de verdad (WhatsApp, SMS o correo): la app prepara los enlaces y avisa dentro de ella.
- Recuperar o cambiar la contraseña desde la app.
- Borrar los datos de una persona desde la app.
- Publicarla en internet: funciona solo en local.

## Fases

- [x] Fase 1 · MVP: la web pública y Faro Gestión para Secretaría, profesores y alumnos, con su acceso, sus
  permisos y datos de ejemplo en una base de datos local compartida — se comprueba: `pnpm check`,
  `pnpm test:e2e` y el recorrido de «Cómo se comprueba que todo funciona». Terminada el 3 de noviembre de
  2026.

## Cómo se comprueba que todo funciona

- `pnpm check`: las reglas de «Qué hace» y los permisos de «Quién puede hacer qué» tienen sus pruebas,
  salvo lo que solo se ve en pantalla (los listados, el resumen de «Hoy» y la fecha aproximada de examen),
  que se comprueba en el recorrido.
- `pnpm test:e2e`: una solicitud de la web llega a Secretaría; cada perfil entra en su portal y no en el de
  los demás; una contraseña equivocada no entra; una cookie inventada no da acceso; un enlace preparado no
  enseña avisos falsos; la lista de interesados no se puede descargar desde la web; y un alumno reserva una
  práctica.
- A mano, con la clave de la IA puesta: el asistente contesta en la web y un profesor dicta una evaluación.
