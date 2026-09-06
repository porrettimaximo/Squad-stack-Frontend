/**
 * Contactos y usuarios oficiales de la plataforma DigitalArs con información bancaria completa.
 */
export const SEED_CONTACTS = [
  {
    id: "2",
    name: "Roberto Carlos",
    email: "robercarlos3@gmail.com",
    accountId: "2",
    accountNumber: "0002-4892-02",
    cvu: "0000003100010000000002",
    alias: "roberto.carlos.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "R",
  },
  {
    id: "3",
    name: "Mohammed Khan",
    email: "mokha@gmail.com",
    accountId: "3",
    accountNumber: "0002-4892-03",
    cvu: "0000003100010000000003",
    alias: "mohammed.khan.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "M",
  },
  {
    id: "4",
    name: "Alejandro Silva",
    email: "alejandro.silva@digitalars.com",
    accountId: "4",
    accountNumber: "0002-4892-04",
    cvu: "0000003100010000000004",
    alias: "alejandro.silva.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "A",
  },
  {
    id: "5",
    name: "Micaela Mulato",
    email: "micaela.mulato@digitalars.com",
    accountId: "5",
    accountNumber: "0002-4892-05",
    cvu: "0000003100010000000005",
    alias: "micaela.mulato.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "M",
  },
  {
    id: "6",
    name: "Emmanuel Torres",
    email: "emmanuel.torres@digitalars.com",
    accountId: "6",
    accountNumber: "0002-4892-06",
    cvu: "0000003100010000000006",
    alias: "emmanuel.torres.ars",
    bank: "DigitalArs Billetera Virtual",
    avatarText: "E",
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
