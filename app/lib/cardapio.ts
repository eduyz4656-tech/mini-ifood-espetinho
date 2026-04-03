export type Produto = {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
};

export type ItemCarrinho = Produto & {
  qtd: number;
};

export type Pedido = {
  id: number;
  nome: string;
  telefone: string;
  tipo_entrega: string;
  endereco: string;
  pagamento: string;
  observacao: string;
  itens: ItemCarrinho[];
  total: number;
  status: string;
};

export const PRODUTOS: Produto[] = [
  { id: 1, nome: "Carne", preco: 8, categoria: "Espetinho avulso tradicional" },
  { id: 2, nome: "Misto Tradicional", preco: 8, categoria: "Espetinho avulso tradicional" },

  { id: 3, nome: "Tulipa", preco: 12, categoria: "Espetinho avulso Premium" },
  { id: 4, nome: "Medalhão de Frango", preco: 12, categoria: "Espetinho avulso Premium" },
  { id: 5, nome: "Medalhão de Carne", preco: 12, categoria: "Espetinho avulso Premium" },
  { id: 6, nome: "Kafta", preco: 12, categoria: "Espetinho avulso Premium" },

  {
    id: 7,
    nome: "Simples - Farofa e Macaxeira",
    preco: 10,
    categoria: "Acompanhamento + espetinho tradicional",
  },
  {
    id: 8,
    nome: "Especial - Macaxeira e Vinagrete",
    preco: 15,
    categoria: "Acompanhamento + espetinho tradicional",
  },
  {
    id: 9,
    nome: "Completo - Arroz, Vinagrete, Farofa, Macaxeira e Banana Frita",
    preco: 20,
    categoria: "Acompanhamento + espetinho tradicional",
  },

  {
    id: 10,
    nome: "Simples Premium - Farofa e Macaxeira",
    preco: 14,
    categoria: "Acompanhamento + espetinho Premium",
  },
  {
    id: 11,
    nome: "Especial Premium - Macaxeira e Vinagrete",
    preco: 18,
    categoria: "Acompanhamento + espetinho Premium",
  },
  {
    id: 12,
    nome: "Completo Premium - Arroz, Vinagrete, Farofa, Macaxeira e Banana Frita",
    preco: 23,
    categoria: "Acompanhamento + espetinho Premium",
  },

  { id: 13, nome: "Maracujá 350ml", preco: 10, categoria: "Sucos" },
  { id: 14, nome: "Acerola 350ml", preco: 8, categoria: "Sucos" },
  { id: 15, nome: "Cupuaçu 350ml", preco: 8, categoria: "Sucos" },
  { id: 16, nome: "Abacaxi c/ Hortelã 350ml", preco: 8, categoria: "Sucos" },

  { id: 17, nome: "Ninho com Nutella", preco: 10, categoria: "Geladinho" },
  { id: 18, nome: "Maracujá com Chocolate", preco: 10, categoria: "Geladinho" },
  { id: 19, nome: "Pudim", preco: 10, categoria: "Geladinho" },
  { id: 20, nome: "Oreo", preco: 10, categoria: "Geladinho" },
  { id: 21, nome: "Ovomaltine", preco: 10, categoria: "Geladinho" },
  { id: 22, nome: "Paçoca", preco: 10, categoria: "Geladinho" },
];

export function dinheiro(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
