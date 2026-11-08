// Lectura de la zona MRZ (formato TD1, ICAO 9303) del reverso del DNI peruano.
// La MRZ son las 3 lineas de 30 caracteres con "<<<" impresas al pie del reverso.

export interface DatosMrz {
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: 'M' | 'F';
  edad: number;
  fechaExpiracion: string;
  controles: { documento: boolean; nacimiento: boolean; expiracion: boolean; compuesto: boolean };
  // true cuando los digitos de control confirman la lectura sin necesidad de repetirla
  confiable: boolean;
}

const PESOS = [7, 3, 1];
const A_DIGITO: Record<string, string> = { O: '0', Q: '0', D: '0', U: '0', I: '1', L: '1', Z: '2', S: '5', B: '8', G: '6', T: '7' };
const A_LETRA: Record<string, string> = { '0': 'O', '1': 'I', '2': 'Z', '5': 'S', '6': 'G', '8': 'B' };

const valorCaracter = (c: string): number => {
  if (c >= '0' && c <= '9') return c.charCodeAt(0) - 48;
  if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 55;
  return 0;
};

export const digitoControl = (s: string): string =>
  String([...s].reduce((acc, c, i) => acc + valorCaracter(c) * PESOS[i % 3], 0) % 10);

const comoDigitos = (s: string) => [...s].map(c => A_DIGITO[c] ?? c).join('');
const comoLetras = (s: string) => [...s].map(c => A_LETRA[c] ?? c).join('');

const normalizar = (linea: string): string =>
  linea
    .toUpperCase()
    .replace(/[«‹(\[{]/g, '<')
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9<]/g, '');

const ajustar30 = (l: string) => (l.length >= 30 ? l.slice(0, 30) : l.padEnd(30, '<'));

const fechaIso = (yymmdd: string, esNacimiento: boolean): string | null => {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const actual = new Date().getFullYear() % 100;
  const siglo = esNacimiento ? (yy > actual ? 1900 : 2000) : 2000;
  return `${siglo + yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
};

const calcularEdad = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
  return edad;
};

const interpretarTd1 = (a: string, b: string, c: string): DatosMrz | null => {
  const l1 = ajustar30(a);
  const l2 = ajustar30(b);
  const l3 = ajustar30(c);

  // Linea 1: I<PER + numero de documento (9) + control + datos opcionales
  if (!/^[I1][<A-Z]?P[E3]R/.test(l1)) return null;

  const campoDoc = comoDigitos(l1.slice(5, 14));
  const ctrlDoc = comoDigitos(l1[14]);
  const opcional = comoDigitos(l1.slice(15, 30));

  let dni = campoDoc.replace(/</g, '').slice(0, 8);
  if (!/^\d{8}$/.test(dni)) {
    const enOpcional = opcional.replace(/</g, '').match(/\d{8}/);
    if (!enOpcional) return null;
    dni = enOpcional[0];
  }

  // Linea 2: nacimiento + control + sexo + expiracion + control + nacionalidad + opcional + compuesto
  const nac = comoDigitos(l2.slice(0, 6));
  const ctrlNac = comoDigitos(l2[6]);
  const sexo = l2[7] === 'F' ? 'F' : l2[7] === 'M' ? 'M' : null;
  const exp = comoDigitos(l2.slice(8, 14));
  const ctrlExp = comoDigitos(l2[14]);
  const ctrlComp = comoDigitos(l2[29]);

  const fechaNacimiento = fechaIso(nac, true);
  const fechaExpiracion = fechaIso(exp, false);
  if (!fechaNacimiento || !sexo) return null;

  const compuesto = `${l1.slice(5, 30)}${l2.slice(0, 7)}${l2.slice(8, 15)}${l2.slice(18, 29)}`;
  const controles = {
    documento: digitoControl(campoDoc) === ctrlDoc,
    nacimiento: digitoControl(nac) === ctrlNac,
    expiracion: digitoControl(exp) === ctrlExp,
    compuesto: digitoControl(comoDigitos(compuesto)) === ctrlComp,
  };
  if (!controles.nacimiento) return null;

  // Linea 3: APELLIDO1<APELLIDO2<<NOMBRE1<NOMBRE2
  const nombresLinea = comoLetras(l3).replace(/[^A-Z<]/g, '<');
  const [apellidos = '', dados = ''] = nombresLinea.split(/<<+/);
  const partesApellido = apellidos.split('<').filter(Boolean);
  const nombres = dados.split('<').filter(Boolean).join(' ');
  if (!partesApellido.length || !nombres) return null;

  return {
    dni,
    apellidoPaterno: partesApellido[0],
    apellidoMaterno: partesApellido.slice(1).join(' '),
    nombres,
    fechaNacimiento,
    sexo,
    edad: calcularEdad(fechaNacimiento),
    fechaExpiracion: fechaExpiracion ?? '',
    controles,
    confiable: controles.documento || controles.compuesto,
  };
};

// Recibe el texto crudo del OCR y devuelve los datos si encuentra una MRZ valida.
export const leerMrz = (textoOcr: string): DatosMrz | null => {
  const lineas = textoOcr
    .split(/\r?\n/)
    .map(normalizar)
    .filter(l => l.length >= 20);

  for (let i = 0; i + 2 < lineas.length; i++) {
    const datos = interpretarTd1(lineas[i], lineas[i + 1], lineas[i + 2]);
    if (datos) return datos;
  }
  return null;
};

// Las lecturas no confiables solo se aceptan si dos fotogramas seguidos coinciden.
export const mismaLectura = (a: DatosMrz | null, b: DatosMrz | null) =>
  !!a && !!b && a.dni === b.dni && a.fechaNacimiento === b.fechaNacimiento && a.sexo === b.sexo;

export const formatearNombre = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase());
