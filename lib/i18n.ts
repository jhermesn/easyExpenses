export type Locale = "pt-BR" | "en-US" | "es-ES"

export interface Translations {
  // Navigation
  dashboard: string
  categories: string
  transactions: string
  reports: string
  settings: string

  // Common
  save: string
  saving: string
  cancel: string
  delete: string
  edit: string
  add: string
  loading: string
  search: string
  filter: string
  all: string
  today: string
  name: string
  category: string
  subcategory: string

  // Dashboard
  welcome: string
  welcomeMessage: string
  createCategories: string
  addTransaction: string
  income: string
  expenses: string
  balance: string
  newTransaction: string
  transactionsAndReports: string
  quickTip: string
  quickTipText: string
  pwaInfo: string
  organizeByCategoriesTitle: string
  organizeByCategoriesDesc: string
  completeControlTitle: string
  completeControlDesc: string
  visualReportsTitle: string
  visualReportsDesc: string
  categoriesPageSubtitle: string
  transactionsPageSubtitle: string

  // Categories
  newCategory: string
  categoryName: string
  categoryType: string
  hasRules: string
  hasRulesHint: string
  subcategories: string
  addSubcategory: string
  percentage: string
  percentagePlaceholder: string
  notes: string
  optional: string
  withRules: string
  totalRules: string
  noCategoriesYet: string
  createFirstCategoryPrompt: string
  createFirstCategory: string
  editCategory: string
  editCategorySubtitle: string
  newCategorySubtitle: string
  organizeYourCategoryIntoSubcategories: string
  categoryNamePlaceholder: string
  categoryNotesPlaceholder: string
  subcategoryNamePlaceholder: string
  subcategoryNotesPlaceholder: string

  // Transactions
  amount: string
  description: string
  transactionType: string
  date: string
  dayOfMonth: string
  installments: string
  installmentPreview: string
  total: string
  // Transactions placeholders
  amountPlaceholder: string
  descriptionPlaceholderIncome: string
  descriptionPlaceholderExpense: string
  dayOfMonthPlaceholder: string
  installmentsPlaceholder: string
  transactionNotesPlaceholder: string
  noTransactionsFound: string
  addFirstTransaction: string
  searchByTitlePlaceholder: string
  selectACategory: string
  selectASubcategory: string
  incomeInfo: string
  incomeCanBeUniqueOrFixed: string
  firstInstallmentDate: string
  incomeCannotBeInstallment: string
  subcategoryRequiredForRuleBasedExpense: string
  subcategoryRequiredForThisCategory: string
  fixedIncomeDayHint: string
  fixedExpenseDayHint: string

  // Transaction Types
  unique: string
  fixed: string
  installment: string

  // Validation
  required: string
  invalidAmount: string
  invalidInstallments: string
  percentageExceeded: string
  fixErrors: string
  allSubcategoriesMustHaveName: string
  rulesNeedAtLeastOneSubcategory: string
  subcategoriesMustHavePercentageGreaterThanZero: string
  confirmDeleteTransaction: string
  confirmDeleteCategory: string
  fixedTransactionDeleteQuestion: string
  fixedTransactionCannotDeleteIndividually: string
  editOriginalTransactionToCancel: string
  errorExportingReport: string
  used: string

  // Reports
  exportPDF: string
  monthlyReport: string
  exporting: string
  weeklyFlow: string
  week: string
  distributionRules: string
  addIncomeToCalculateRules: string

  // Settings
  language: string
  currency: string
  theme: string

  // Settings page
  settingsSubtitle: string
  languageAndCurrency: string
  languageAndCurrencySubtitle: string
  applyingChanges: string
  appInfo: string
  version: string
  versionCode: string
  author: string
  developedBy: string
  appDetails: string
  appName: string

  // Footer / Legal
  by: string
  licensedUnder: string
  licenseShortName: string

  // Report
  financialSummary: string
  typeLabel: string
  valueLabel: string
  transactionsByCategory: string
  transactionsList: string
  titleLabel: string
  reportInfo: string
  generatedOn: string
  totalTransactions: string
  reportFilePrefix: string
}

const translations: Record<Locale, Translations> = {
  "pt-BR": {
    // Navigation
    dashboard: "Dashboard",
    categories: "Categorias",
    transactions: "Extratos",
    reports: "Relatórios",
    settings: "Configurações",

    // Common
    save: "Salvar",
    saving: "Salvando...",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    add: "Adicionar",
    loading: "Carregando...",
    search: "Buscar",
    filter: "Filtros",
    all: "Todos",
    today: "Hoje",
    name: "Nome",
    category: "Categoria",
    subcategory: "Subcategoria",

    // Dashboard
    welcome: "Bem-vindo ao Easy Expenses",
    welcomeMessage: "Para começar, você precisa criar suas primeiras categorias e adicionar suas transações.",
    createCategories: "Criar Categorias",
    addTransaction: "Adicionar Transação",
    income: "Entradas",
    expenses: "Saídas",
    balance: "Saldo",
    newTransaction: "Nova Transação",
    transactionsAndReports: "Extratos & Relatórios",
    quickTip: "Dica Rápida",
    quickTipText:
      "Comece criando suas categorias principais (ex: Essencial, Lazer, Investimentos) e depois adicione suas primeiras transações. O app funciona 100% offline e seus dados ficam seguros no seu dispositivo.",
    pwaInfo: "Este é um PWA - você pode instalá-lo em seu dispositivo para uma experiência nativa",
    organizeByCategoriesTitle: "Organize por Categorias",
    organizeByCategoriesDesc: "Crie categorias personalizadas com regras de porcentagem",
    completeControlTitle: "Controle Completo",
    completeControlDesc: "Gerencie entradas, saídas fixas e parcelamentos",
    visualReportsTitle: "Relatórios Visuais",
    visualReportsDesc: "Gráficos interativos e exportação em PDF",
    categoriesPageSubtitle: "Organize suas finanças por categorias",
    transactionsPageSubtitle: "Visualize e analise suas transações",

    // Categories
    newCategory: "Nova Categoria",
    categoryName: "Nome da Categoria",
    categoryType: "Tipo",
    hasRules: "Esta categoria possui regras de porcentagem",
    hasRulesHint: "Ex: 50% Essencial, 30% Não Essencial, 20% Investimentos",
    subcategories: "Subcategorias",
    addSubcategory: "Adicionar",
    percentage: "Porcentagem (%)",
    percentagePlaceholder: "50",
    notes: "Observações",
    optional: "opcional",
    withRules: "Com Regras",
    totalRules: "Total das regras:",
    noCategoriesYet: "Nenhuma categoria criada ainda",
    createFirstCategoryPrompt: "Crie sua primeira categoria para começar a organizar suas finanças",
    createFirstCategory: "Criar primeira categoria",
    editCategory: "Editar Categoria",
    editCategorySubtitle: "Modifique os dados da categoria",
    newCategorySubtitle: "Crie uma nova categoria para organizar suas finanças",
    organizeYourCategoryIntoSubcategories: "Organize sua categoria em subcategorias específicas",
    categoryNamePlaceholder: "Ex: Dinheiro Geral, Vale Alimentação",
    categoryNotesPlaceholder: "Observações sobre esta categoria...",
    subcategoryNamePlaceholder: "Ex: Gastos Essenciais",
    subcategoryNotesPlaceholder: "Observações sobre esta subcategoria...",

    // Transactions
    amount: "Valor",
    description: "Descrição",
    transactionType: "Tipo de Transação",
    date: "Data",
    dayOfMonth: "Dia do Mês (1-31)",
    installments: "Número de Parcelas",
    installmentPreview: "Prévia do Parcelamento:",
    total: "Total",
    amountPlaceholder: "0,00",
    descriptionPlaceholderIncome: "Ex: Salário, Freelance, Venda",
    descriptionPlaceholderExpense: "Ex: Supermercado, Combustível, Conta de Luz",
    dayOfMonthPlaceholder: "1",
    installmentsPlaceholder: "12",
    transactionNotesPlaceholder: "Observações sobre esta transação...",
    noTransactionsFound: "Nenhuma transação encontrada",
    addFirstTransaction: "Adicionar primeira transação",
    searchByTitlePlaceholder: "Buscar por título...",
    selectACategory: "Selecione uma categoria",
    selectASubcategory: "Selecione uma subcategoria",
    incomeInfo:
      "Entradas: Não possuem subcategorias nem parcelamento. Use apenas para receitas como salários, vendas, etc.",
    incomeCanBeUniqueOrFixed: "Entradas podem ser únicas ou fixas (mensais), mas não parceladas",
    firstInstallmentDate: "Data da Primeira Parcela",
    incomeCannotBeInstallment: "Entradas não podem ser parceladas",
    subcategoryRequiredForRuleBasedExpense: "Subcategoria é obrigatória para categorias de saída com regras",
    subcategoryRequiredForThisCategory: "Subcategoria é obrigatória para esta categoria",
    fixedIncomeDayHint: "Entradas fixas se repetem mensalmente neste dia (ex: salário no dia 5)",
    fixedExpenseDayHint: "Saídas fixas se repetem mensalmente neste dia (ex: aluguel no dia 10)",

    // Transaction Types
    unique: "Única",
    fixed: "Fixa (mensal)",
    installment: "Parcelada",

    // Validation
    required: "é obrigatório",
    invalidAmount: "Valor deve ser maior que zero",
    invalidInstallments: "Parcelamento deve ter pelo menos 2 parcelas",
    percentageExceeded: "A soma das porcentagens não pode ultrapassar 100%",
    fixErrors: "Corrija os seguintes erros:",
    allSubcategoriesMustHaveName: "Todas as subcategorias devem ter nome",
    rulesNeedAtLeastOneSubcategory: "Categorias com regras devem ter pelo menos uma subcategoria",
    subcategoriesMustHavePercentageGreaterThanZero:
      "Todas as subcategorias com regras devem ter porcentagem maior que 0",
    confirmDeleteTransaction: "Tem certeza que deseja excluir esta transação?",
    confirmDeleteCategory: "Tem certeza que deseja excluir esta categoria?",
    fixedTransactionDeleteQuestion:
      "Esta é uma transação fixa. Deseja excluir apenas deste mês (Sim) ou cancelar a transação fixa permanentemente (Não)?",
    fixedTransactionCannotDeleteIndividually:
      "Transações fixas não podem ser excluídas individualmente. Para cancelar permanentemente, edite a transação original.",
    editOriginalTransactionToCancel: "Edite a transação original para cancelar permanentemente.",
    errorExportingReport: "Erro ao exportar relatório. Tente novamente.",
    used: "utilizado",

    // Reports
    exportPDF: "Exportar PDF",
    monthlyReport: "Relatório Mensal",
    exporting: "Exportando...",
    weeklyFlow: "Fluxo Semanal",
    week: "Semana",
    distributionRules: "Regras de distribuição (baseado no total de entradas)",
    addIncomeToCalculateRules: "Adicione entradas para calcular o orçamento das regras",

    // Settings
    language: "Idioma",
    currency: "Moeda",
    theme: "Tema",
    settingsSubtitle: "Personalize sua experiência no app",
    languageAndCurrency: "Idioma e Moeda",
    languageAndCurrencySubtitle: "Configure o idioma e a moeda do aplicativo",
    applyingChanges: "Aplicando alterações...",
    appInfo: "Informações do App",
    appDetails: "Detalhes sobre o aplicativo",
    version: "Versão",
    versionCode: "1.0.0",
    author: "Jorge Hermes",
    developedBy: "Desenvolvido por",
    appName: "Easy Expenses",

    // Footer / Legal
    by: "por",
    licensedUnder: "está licenciado sob",
    licenseShortName: "CC BY-NC-SA 4.0",

    // Report
    financialSummary: "Resumo Financeiro",
    typeLabel: "Tipo",
    valueLabel: "Valor",
    transactionsByCategory: "Transações por Categoria",
    transactionsList: "Lista de Transações",
    titleLabel: "Título",
    reportInfo: "Informações do Relatório",
    generatedOn: "Gerado em",
    totalTransactions: "Total de transações",
    reportFilePrefix: "relatorio",
  },

  "en-US": {
    // Navigation
    dashboard: "Dashboard",
    categories: "Categories",
    transactions: "Transactions",
    reports: "Reports",
    settings: "Settings",

    // Common
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    loading: "Loading...",
    search: "Search",
    filter: "Filters",
    all: "All",
    today: "Today",
    name: "Name",
    category: "Category",
    subcategory: "Subcategory",

    // Dashboard
    welcome: "Welcome to Easy Expenses",
    welcomeMessage: "To get started, you need to create your first categories and add your transactions.",
    createCategories: "Create Categories",
    addTransaction: "Add Transaction",
    income: "Income",
    expenses: "Expenses",
    balance: "Balance",
    newTransaction: "New Transaction",
    transactionsAndReports: "Transactions & Reports",
    quickTip: "Quick Tip",
    quickTipText:
      "Start by creating your main categories (e.g., Essential, Leisure, Investments) and then add your first transactions. The app works 100% offline and your data stays safe on your device.",
    pwaInfo: "This is a PWA - you can install it on your device for a native-like experience",
    organizeByCategoriesTitle: "Organize by Categories",
    organizeByCategoriesDesc: "Create custom categories with percentage rules",
    completeControlTitle: "Complete Control",
    completeControlDesc: "Manage income, fixed expenses and installments",
    visualReportsTitle: "Visual Reports",
    visualReportsDesc: "Interactive charts and PDF export",
    categoriesPageSubtitle: "Organize your finances by categories",
    transactionsPageSubtitle: "View and analyze your transactions",

    // Categories
    newCategory: "New Category",
    categoryName: "Category Name",
    categoryType: "Type",
    hasRules: "This category has percentage rules",
    hasRulesHint: "e.g., 50% Essential, 30% Non-Essential, 20% Investments",
    subcategories: "Subcategories",
    addSubcategory: "Add",
    percentage: "Percentage (%)",
    percentagePlaceholder: "50",
    notes: "Notes",
    optional: "optional",
    withRules: "With Rules",
    totalRules: "Total rules:",
    noCategoriesYet: "No categories created yet",
    createFirstCategoryPrompt: "Create your first category to start organizing your finances",
    createFirstCategory: "Create first category",
    editCategory: "Edit Category",
    editCategorySubtitle: "Modify the category details",
    newCategorySubtitle: "Create a new category to organize your finances",
    organizeYourCategoryIntoSubcategories: "Organize your category into specific subcategories",
    categoryNamePlaceholder: "e.g., General Cash, Food Voucher",
    categoryNotesPlaceholder: "Notes about this category...",
    subcategoryNamePlaceholder: "e.g., Essential Spending",
    subcategoryNotesPlaceholder: "Notes about this subcategory...",

    // Transactions
    amount: "Amount",
    description: "Description",
    transactionType: "Transaction Type",
    date: "Date",
    dayOfMonth: "Day of Month (1-31)",
    installments: "Number of Installments",
    installmentPreview: "Installment Preview:",
    total: "Total",
    amountPlaceholder: "0.00",
    descriptionPlaceholderIncome: "e.g., Salary, Freelance, Sale",
    descriptionPlaceholderExpense: "e.g., Groceries, Gas, Electricity Bill",
    dayOfMonthPlaceholder: "1",
    installmentsPlaceholder: "12",
    transactionNotesPlaceholder: "Notes about this transaction...",
    noTransactionsFound: "No transactions found",
    addFirstTransaction: "Add first transaction",
    searchByTitlePlaceholder: "Search by title...",
    selectACategory: "Select a category",
    selectASubcategory: "Select a subcategory",
    incomeInfo:
      "Income: Do not have subcategories or installments. Use only for revenue such as salary, sales, etc.",
    incomeCanBeUniqueOrFixed: "Income can be one-time or fixed (monthly), but not installment",
    firstInstallmentDate: "First Installment Date",
    incomeCannotBeInstallment: "Income cannot be installment",
    subcategoryRequiredForRuleBasedExpense: "Subcategory is required for rule-based expense categories",
    subcategoryRequiredForThisCategory: "Subcategory is required for this category",
    fixedIncomeDayHint: "Fixed income repeats monthly on this day (e.g., salary on the 5th)",
    fixedExpenseDayHint: "Fixed expenses repeat monthly on this day (e.g., rent on the 10th)",

    // Transaction Types
    unique: "One-time",
    fixed: "Fixed (monthly)",
    installment: "Installment",

    // Validation
    required: "is required",
    invalidAmount: "Amount must be greater than zero",
    invalidInstallments: "Installment must have at least 2 payments",
    percentageExceeded: "The sum of percentages cannot exceed 100%",
    fixErrors: "Please fix the following errors:",
    allSubcategoriesMustHaveName: "All subcategories must have a name",
    rulesNeedAtLeastOneSubcategory: "Rule-based categories must have at least one subcategory",
    subcategoriesMustHavePercentageGreaterThanZero:
      "All rule-based subcategories must have a percentage greater than 0",
    confirmDeleteTransaction: "Are you sure you want to delete this transaction?",
    confirmDeleteCategory: "Are you sure you want to delete this category?",
    fixedTransactionDeleteQuestion:
      "This is a fixed transaction. Do you want to delete only this month (Yes) or cancel the fixed transaction permanently (No)?",
    fixedTransactionCannotDeleteIndividually:
      "Fixed transactions cannot be deleted individually. To cancel permanently, edit the original transaction.",
    editOriginalTransactionToCancel: "Edit the original transaction to cancel permanently.",
    errorExportingReport: "Error exporting report. Please try again.",
    used: "used",

    // Reports
    exportPDF: "Export PDF",
    monthlyReport: "Monthly Report",
    exporting: "Exporting...",
    weeklyFlow: "Weekly Flow",
    week: "Week",
    distributionRules: "Distribution rules (based on total income)",
    addIncomeToCalculateRules: "Add income to calculate rule budgets",

    // Settings
    language: "Language",
    currency: "Currency",
    theme: "Theme",
    settingsSubtitle: "Customize your app experience",
    languageAndCurrency: "Language and Currency",
    languageAndCurrencySubtitle: "Configure the app's language and currency",
    applyingChanges: "Applying changes...",
    appInfo: "App Info",
    appDetails: "App details",
    version: "Version",
    versionCode: "1.0.0",
    author: "Jorge Hermes",
    developedBy: "Developed by",
    appName: "Easy Expenses",

    // Footer / Legal
    by: "by",
    licensedUnder: "is licensed under",
    licenseShortName: "CC BY-NC-SA 4.0",

    // Report
    financialSummary: "Financial Summary",
    typeLabel: "Type",
    valueLabel: "Value",
    transactionsByCategory: "Transactions by Category",
    transactionsList: "Transactions List",
    titleLabel: "Title",
    reportInfo: "Report Information",
    generatedOn: "Generated on",
    totalTransactions: "Total transactions",
    reportFilePrefix: "report",
  },

  "es-ES": {
    // Navigation
    dashboard: "Panel",
    categories: "Categorías",
    transactions: "Transacciones",
    reports: "Informes",
    settings: "Configuración",

    // Common
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    loading: "Cargando...",
    search: "Buscar",
    filter: "Filtros",
    all: "Todas",
    today: "Hoy",
    name: "Nombre",
    category: "Categoría",
    subcategory: "Subcategoría",

    // Dashboard
    welcome: "Bienvenido a Easy Expenses",
    welcomeMessage: "Para comenzar, necesitas crear tus primeras categorías y agregar tus transacciones.",
    createCategories: "Crear Categorías",
    addTransaction: "Agregar Transacción",
    income: "Ingresos",
    expenses: "Gastos",
    balance: "Balance",
    newTransaction: "Nueva Transacción",
    transactionsAndReports: "Extractos e Informes",
    quickTip: "Consejo Rápido",
    quickTipText:
      "Comienza creando tus categorías principales (ej: Esencial, Ocio, Inversiones) y luego agrega tus primeras transacciones. La aplicación funciona 100% offline y tus datos permanecen seguros en tu dispositivo.",
    pwaInfo: "Esto es un PWA: puedes instalarlo en tu dispositivo para una experiencia nativa",
    organizeByCategoriesTitle: "Organiza por Categorías",
    organizeByCategoriesDesc: "Crea categorías personalizadas con reglas de porcentaje",
    completeControlTitle: "Control Completo",
    completeControlDesc: "Gestiona ingresos, gastos fijos y cuotas",
    visualReportsTitle: "Informes Visuales",
    visualReportsDesc: "Gráficos interactivos y exportación a PDF",
    categoriesPageSubtitle: "Organiza tus finanzas por categorías",
    transactionsPageSubtitle: "Visualiza y analiza tus transacciones",

    // Categories
    newCategory: "Nueva Categoría",
    categoryName: "Nombre de Categoría",
    categoryType: "Tipo",
    hasRules: "Esta categoría tiene reglas de porcentaje",
    hasRulesHint: "Ej: 50% Esencial, 30% No Esencial, 20% Inversiones",
    subcategories: "Subcategorías",
    addSubcategory: "Agregar",
    percentage: "Porcentaje (%)",
    percentagePlaceholder: "50",
    notes: "Notas",
    optional: "opcional",
    withRules: "Con Reglas",
    totalRules: "Total de reglas:",
    noCategoriesYet: "Aún no hay categorías creadas",
    createFirstCategoryPrompt: "Crea tu primera categoría para comenzar a organizar tus finanzas",
    createFirstCategory: "Crear primera categoría",
    editCategory: "Editar Categoría",
    editCategorySubtitle: "Modifica los datos de la categoría",
    newCategorySubtitle: "Crea una nueva categoría para organizar tus finanzas",
    organizeYourCategoryIntoSubcategories: "Organiza tu categoría en subcategorías específicas",
    categoryNamePlaceholder: "Ej: Dinero General, Vale de Comida",
    categoryNotesPlaceholder: "Notas sobre esta categoría...",
    subcategoryNamePlaceholder: "Ej: Gastos Esenciales",
    subcategoryNotesPlaceholder: "Notas sobre esta subcategoría...",

    // Transactions
    amount: "Cantidad",
    description: "Descripción",
    transactionType: "Tipo de Transacción",
    date: "Fecha",
    dayOfMonth: "Día del Mes (1-31)",
    installments: "Número de Cuotas",
    installmentPreview: "Vista Previa de Cuotas:",
    total: "Total",
    amountPlaceholder: "0,00",
    descriptionPlaceholderIncome: "Ej: Salario, Freelance, Venta",
    descriptionPlaceholderExpense: "Ej: Supermercado, Gasolina, Luz",
    dayOfMonthPlaceholder: "1",
    installmentsPlaceholder: "12",
    transactionNotesPlaceholder: "Notas sobre esta transacción...",
    noTransactionsFound: "No se encontraron transacciones",
    addFirstTransaction: "Agregar primera transacción",
    searchByTitlePlaceholder: "Buscar por título...",
    selectACategory: "Selecciona una categoría",
    selectASubcategory: "Selecciona una subcategoría",
    incomeInfo:
      "Ingresos: No tienen subcategorías ni cuotas. Úsalos sólo para ingresos como salarios, ventas, etc.",
    incomeCanBeUniqueOrFixed: "Los ingresos pueden ser únicos o fijos (mensuales), pero no en cuotas",
    firstInstallmentDate: "Fecha de la Primera Cuota",
    incomeCannotBeInstallment: "Los ingresos no pueden ser en cuotas",
    subcategoryRequiredForRuleBasedExpense: "La subcategoría es obligatoria para categorías de gasto con reglas",
    subcategoryRequiredForThisCategory: "La subcategoría es obligatoria para esta categoría",
    fixedIncomeDayHint: "Los ingresos fijos se repiten mensualmente en este día (ej: salario el día 5)",
    fixedExpenseDayHint: "Los gastos fijos se repiten mensualmente en este día (ej: alquiler el día 10)",

    // Transaction Types
    unique: "Única",
    fixed: "Fija (mensual)",
    installment: "A plazos",

    // Validation
    required: "es requerido",
    invalidAmount: "La cantidad debe ser mayor que cero",
    invalidInstallments: "Las cuotas deben tener al menos 2 pagos",
    percentageExceeded: "La suma de porcentajes no puede exceder el 100%",
    fixErrors: "Corrige los siguientes errores:",
    allSubcategoriesMustHaveName: "Todas las subcategorías deben tener nombre",
    rulesNeedAtLeastOneSubcategory: "Las categorías con reglas deben tener al menos una subcategoría",
    subcategoriesMustHavePercentageGreaterThanZero:
      "Todas las subcategorías con reglas deben tener un porcentaje mayor que 0",
    confirmDeleteTransaction: "¿Está seguro de que desea eliminar esta transacción?",
    confirmDeleteCategory: "¿Está seguro de que desea eliminar esta categoría?",
    fixedTransactionDeleteQuestion:
      "Esta es una transacción fija. ¿Desea eliminar sólo este mes (Sí) o cancelar la transacción fija permanentemente (No)?",
    fixedTransactionCannotDeleteIndividually:
      "Las transacciones fijas no pueden ser eliminadas individualmente. Para cancelar permanentemente, edite la transacción original.",
    editOriginalTransactionToCancel: "Edite la transacción original para cancelar permanentemente.",
    errorExportingReport: "Error al exportar el informe. Inténtelo de nuevo.",
    used: "utilizado",

    // Reports
    exportPDF: "Exportar PDF",
    monthlyReport: "Informe Mensual",
    exporting: "Exportando...",
    weeklyFlow: "Flujo Semanal",
    week: "Semana",
    distributionRules: "Reglas de distribución (basadas en el total de ingresos)",
    addIncomeToCalculateRules: "Agrega ingresos para calcular el presupuesto de las reglas",

    // Settings
    language: "Idioma",
    currency: "Moneda",
    theme: "Tema",
    settingsSubtitle: "Personaliza tu experiencia en la app",
    languageAndCurrency: "Idioma y Moneda",
    languageAndCurrencySubtitle: "Configura el idioma y la moneda de la aplicación",
    applyingChanges: "Aplicando cambios...",
    appInfo: "Información de la App",
    appDetails: "Detalles de la aplicación",
    version: "Versión",
    versionCode: "1.0.0",
    author: "Jorge Hermes",
    developedBy: "Desarrollado por",
    appName: "Easy Expenses",

    // Footer / Legal
    by: "por",
    licensedUnder: "está bajo la licencia",
    licenseShortName: "CC BY-NC-SA 4.0",

    // Report
    financialSummary: "Resumen Financiero",
    typeLabel: "Tipo",
    valueLabel: "Valor",
    transactionsByCategory: "Transacciones por Categoría",
    transactionsList: "Lista de Transacciones",
    titleLabel: "Título",
    reportInfo: "Información del Informe",
    generatedOn: "Generado el",
    totalTransactions: "Total de transacciones",
    reportFilePrefix: "informe",
  },
}

export const currencies = {
  "pt-BR": { code: "BRL", symbol: "R$" },
  "en-US": { code: "USD", symbol: "$" },
  "es-ES": { code: "EUR", symbol: "€" },
}

let currentCurrencyCode: string | null = null

let currentLocale: Locale = "pt-BR"

export function setLocale(locale: Locale) {
  currentLocale = locale
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale)
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("locale") as Locale
    if (stored && translations[stored]) {
      currentLocale = stored
    }
  }
  return currentLocale
}

export function t(key: keyof Translations): string {
  const locale = getLocale()
  return translations[locale][key] || translations["pt-BR"][key] || key
}

export function tStatic(key: keyof Translations): string {
  return translations["pt-BR"][key] || key
}

export function formatCurrencyI18n(amount: number, locale?: Locale): string {
  const currentLoc = locale || getLocale()
  const storedCurrency =
    typeof window !== "undefined" ? localStorage.getItem("currencyCode") : null
  const currencyCode = storedCurrency || currencies[currentLoc].code
  return new Intl.NumberFormat(currentLoc, {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}
