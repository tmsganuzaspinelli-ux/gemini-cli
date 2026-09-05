/**
 * La cinemateca del Profesor Charles.
 *
 * No es un catálogo exhaustivo: es una selección corta y muy deliberada de
 * películas amables, sin violencia gráfica y con frases memorables que se
 * prestan a una micro-lección. Charles recibe la selección que encaja con el
 * contexto vital detectado y elige de ahí (o de su propio saber cinéfilo, si
 * algo le encaja mejor).
 */

export type ContextoVital = 'nietos' | 'soledad' | 'cocina' | 'viaje' | 'general';

export type Pelicula = {
  titulo: string;
  anio: number;
  /** Frase mítica, en inglés, apta para aprender. */
  frase: string;
  /** Qué quiere decir, en castellano llano. */
  significado: string;
  /** Fonética amable, escrita como se leería en español. */
  fonetica: string;
  /** Por qué se la recomienda: la nota cálida que acompaña. */
  porQue: string;
  contextos: ContextoVital[];
};

export const CINEMATECA: Pelicula[] = [
  // --- Para ver con nietos ---
  {
    titulo: 'Paddington',
    anio: 2014,
    frase: 'If we are kind and polite, the world will be right.',
    significado: 'Si somos amables y educados, el mundo estará bien.',
    fonetica: '/If güi ar cáind and polait, de guorld güil bi rait/',
    porQue: 'Un osito peruano en Londres: ternura, buenos modales y risas para toda la familia.',
    contextos: ['nietos'],
  },
  {
    titulo: 'Babe',
    anio: 1995,
    frase: 'That will do, pig. That will do.',
    significado: 'Con eso basta, cerdito. Con eso basta.',
    fonetica: '/Dat güil du, pig. Dat güil du/',
    porQue: 'Un cerdito que quiere ser perro pastor. Dulce, tranquila y con un final que emociona.',
    contextos: ['nietos'],
  },
  {
    titulo: 'My Neighbor Totoro',
    anio: 1988,
    frase: 'Trees and people used to be good friends.',
    significado: 'Los árboles y las personas eran buenos amigos.',
    fonetica: '/Tris and pípol iúst tu bi gud frends/',
    porQue: 'Animación japonesa serena, sin malos ni sustos: pura fantasía para los pequeños.',
    contextos: ['nietos'],
  },
  {
    titulo: 'Mary Poppins',
    anio: 1964,
    frase: 'In every job that must be done, there is an element of fun.',
    significado: 'En cada tarea que hay que hacer, hay algo de diversión.',
    fonetica: '/In évri llob dat mast bi dan, der is an élement of fan/',
    porQue: 'Un musical alegre con canciones que los nietos tararearán toda la tarde.',
    contextos: ['nietos'],
  },
  {
    titulo: 'The Sound of Music',
    anio: 1965,
    frase: 'The hills are alive with the sound of music.',
    significado: 'Las colinas están vivas con el sonido de la música.',
    fonetica: '/De jils ar aláiv güid de sáund of miúsic/',
    porQue: 'Sonrisas y lágrimas: montañas, canciones y una familia entera cantando.',
    contextos: ['nietos', 'soledad'],
  },

  // --- Para una tarde tranquila o de lluvia ---
  {
    titulo: 'Casablanca',
    anio: 1942,
    frase: "Here's looking at you, kid.",
    significado: 'Brindo por ti, pequeña. (Un brindis con mucho cariño dentro.)',
    fonetica: '/Jíars lúking at iú, kid/',
    porQue: 'El clásico de los clásicos: amor, sacrificio y un piano que nunca se olvida.',
    contextos: ['soledad'],
  },
  {
    titulo: 'Roman Holiday',
    anio: 1953,
    frase: 'Rome, by all means, Rome.',
    significado: 'Roma, sin duda alguna, Roma.',
    fonetica: '/Róum, bai ol míns, Róum/',
    porQue: 'Audrey Hepburn recorriendo Roma en Vespa: ligera, elegante y con un final precioso.',
    contextos: ['soledad', 'viaje'],
  },
  {
    titulo: 'Enchanted April',
    anio: 1991,
    frase: 'To those who appreciate wisteria and sunshine.',
    significado: 'Para quienes aprecian las glicinias y el sol.',
    fonetica: '/Tu dous ju apríshieit güistíria and sánshain/',
    porQue: 'Cuatro mujeres alquilan un castillo en Italia. Es como una tarde de sol en una taza de té.',
    contextos: ['soledad', 'viaje'],
  },
  {
    titulo: 'Singin’ in the Rain',
    anio: 1952,
    frase: "I'm singing in the rain, just singing in the rain.",
    significado: 'Estoy cantando bajo la lluvia, sencillamente cantando bajo la lluvia.',
    fonetica: '/Aim sínguin in de réin, llast sínguin in de réin/',
    porQue: 'El mejor antídoto que conozco para un día gris: Gene Kelly y su paraguas.',
    contextos: ['soledad'],
  },
  {
    titulo: "It's a Wonderful Life",
    anio: 1946,
    frase: 'No man is a failure who has friends.',
    significado: 'Ningún hombre fracasa si tiene amigos.',
    fonetica: '/Nou man is a féiliur ju jas frends/',
    porQue: '¡Qué bello es vivir! Para recordar cuánta huella deja una vida en los demás.',
    contextos: ['soledad'],
  },

  // --- Cocina y mesa ---
  {
    titulo: 'Ratatouille',
    anio: 2007,
    frase: 'Anyone can cook.',
    significado: 'Cualquiera puede cocinar.',
    fonetica: '/Éniuan can cuk/',
    porQue: 'Una ratita en una cocina de París. Perfecta si hoy huele bien en su casa.',
    contextos: ['cocina', 'nietos'],
  },
  {
    titulo: 'Babette’s Feast',
    anio: 1987,
    frase: 'An artist is never poor.',
    significado: 'Un artista nunca es pobre.',
    fonetica: '/An ártist is néver pur/',
    porQue: 'La cena más hermosa del cine. Una cocinera que lo da todo en un solo banquete.',
    contextos: ['cocina'],
  },
  {
    titulo: 'Julie & Julia',
    anio: 2009,
    frase: 'Bon appétit!',
    significado: '¡Buen provecho! (Julia Child lo decía en francés, ¡también en inglés!)',
    fonetica: '/Bon apetí/',
    porQue: 'Dos cocinas, dos épocas y mucha mantequilla. Alegre y de buen comer.',
    contextos: ['cocina'],
  },

  // --- Viajes y anécdotas ---
  {
    titulo: 'The Trip to Italy',
    anio: 2014,
    frase: 'What a view!',
    significado: '¡Qué vistas!',
    fonetica: '/Guat a viú/',
    porQue: 'Dos amigos recorriendo Italia comiendo y riendo. Un viaje sin salir del sofá.',
    contextos: ['viaje', 'cocina'],
  },
  {
    titulo: 'Out of Africa',
    anio: 1985,
    frase: 'I had a farm in Africa.',
    significado: 'Yo tenía una granja en África.',
    fonetica: '/Ai jad a farm in África/',
    porQue: 'Paisajes inmensos y una historia de recuerdos. Ideal si hoy le apetece recordar.',
    contextos: ['viaje', 'soledad'],
  },
];

/** Devuelve la selección que Charles llevará "bajo el brazo" a esta respuesta. */
export function peliculasPara(contexto: ContextoVital, limite = 4): Pelicula[] {
  const encajan = CINEMATECA.filter((p) => p.contextos.includes(contexto));
  const fuente = encajan.length > 0 ? encajan : CINEMATECA;
  return fuente.slice(0, limite);
}
