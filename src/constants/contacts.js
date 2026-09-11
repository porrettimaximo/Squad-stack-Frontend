/**
 * Contactos y usuarios oficiales de la plataforma DigitalArs con información bancaria completa.
 */
export const SEED_CONTACTS = [
  {
    id: "2",
    name: "Mateo Rossi",
    email: "mateo.rossi@gmail.com",
    accountId: "2",
    accountNumber: "0002-4892-02",
    cvu: "0000003100010000000002",
    alias: "mateo.rossi.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "MR",
  },
  {
    id: "3",
    name: "Sofía Martínez",
    email: "sofia.martinez@gmail.com",
    accountId: "3",
    accountNumber: "0002-4892-03",
    cvu: "0000003100010000000003",
    alias: "sofia.martinez.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "SM",
  },
  {
    id: "4",
    name: "Lucas Benítez",
    email: "lucas.benitez@gmail.com",
    accountId: "4",
    accountNumber: "0002-4892-04",
    cvu: "0000003100010000000004",
    alias: "lucas.benitez.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "LB",
  },
  {
    id: "5",
    name: "Camila Fernández",
    email: "camila.fernandez@gmail.com",
    accountId: "5",
    accountNumber: "0002-4892-05",
    cvu: "0000003100010000000005",
    alias: "camila.fernandez.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "CF",
  },
  {
    id: "6",
    name: "Joaquín Díaz",
    email: "joaquin.diaz@gmail.com",
    accountId: "6",
    accountNumber: "0002-4892-06",
    cvu: "0000003100010000000006",
    alias: "joaquin.diaz.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "JD",
  },
  {
    id: "7",
    name: "Valentina Gómez",
    email: "valentina.gomez@gmail.com",
    accountId: "7",
    accountNumber: "0002-4892-07",
    cvu: "0000003100010000000007",
    alias: "valentina.gomez.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "VG",
  },
  {
    id: "8",
    name: "Diego Romero",
    email: "diego.romero@gmail.com",
    accountId: "8",
    accountNumber: "0002-4892-08",
    cvu: "0000003100010000000008",
    alias: "diego.romero.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "DR",
  },
];

/**
 * Busca un contacto registrado por ID, alias, CVU, email o nombre.
 */
export function findContact(query) {
  if (!query) return null;
  const q = query.toString().trim().toLowerCase();
  return SEED_CONTACTS.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.accountId.toLowerCase() === q ||
      c.alias.toLowerCase() === q ||
      c.email.toLowerCase() === q ||
      c.cvu.toLowerCase() === q ||
      c.name.toLowerCase() === q
  ) || null;
}
