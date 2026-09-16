export const CLIENTE_CSV_CONFIG = {
  templateHeaders: [
    // Dados pessoais (obrigatórios)
    { key: "nome", label: "Nome Doutor", required: true, example: "Dr. João Silva" },
    { key: "tipo_pessoa", label: "Tipo (PF/PJ)", required: true, example: "PF" },
    { key: "cpf_cnpj", label: "CPF/CNPJ", required: false, example: "123.456.789-00" },

    // Contato
    { key: "email", label: "Email", required: false, example: "joao@email.com" },
    { key: "telefone", label: "Telefone", required: false, example: "11988887777" },
    { key: "whatsapp", label: "WhatsApp", required: false, example: "11988887777" },

    // Clínica / Empresa
    { key: "nome_clinica", label: "Nome Clínica", required: false, example: "Clínica Silva" },

    // Endereço completo
    { key: "cep", label: "CEP", required: false, example: "01310-100" },
    { key: "rua", label: "Rua", required: false, example: "Av. Paulista" },
    { key: "numero", label: "Número", required: false, example: "1000" },
    { key: "bairro", label: "Bairro", required: false, example: "Bela Vista" },
    { key: "complemento", label: "Complemento", required: false, example: "Sala 101" },
    { key: "cidade", label: "Cidade", required: false, example: "São Paulo" },
    { key: "estado", label: "Estado", required: false, example: "SP" },

    // CRM / Observações
    { key: "consultor", label: "Consultor (email)", required: false, example: "consultor@email.com" },
    { key: "status", label: "Status", required: false, example: "ativo" },
    { key: "observacoes", label: "Observações", required: false, example: "Cliente desde 2024" },
    { key: "colaborador", label: "Colaborador", required: false, example: "Maria Santos" },
    { key: "codigo_cliente", label: "Código Cliente", required: false, example: "CLI-001" },
  ],
  requiredFields: ["nome", "tipo_pessoa"],
};
