// Text constants for product management
export const PRODUCT_TEXT = {
  // Page titles
  PAGE_TITLE: 'ໜ້າຈັດການສິນຄ້າ',
  ADD_PRODUCT: 'ເພີ່ມສິນຄ້າ',
  EDIT_PRODUCT: 'ແກ້ໄຂສິນຄ້າ',
  PRODUCT_INFO: 'ຂໍ້ມູນສິນຄ້າ',
  UPDATE_STATUS: 'ອັບເດດສະຖານະ',

  // Form labels
  LABELS: {
    STATUS: 'ສະຖານະ',
    PRODUCT_CODE: 'ລະຫັດສິນຄ້າ',
    CUSTOMER_PHONE: 'ເບີໂທລູກຄ້າ',
    CUSTOMER_NAME: 'ຊື່ລູກຄ້າ',
    PRICE: 'ລາຄາ',
    CURRENCY: 'ສະກຸນເງິນ',
    SERVICE_TYPE: 'ປະເພດການບໍລິການ',
    TRACKING_NUMBER: 'ເລກທີ່ຕິດຕາມ',
    PHONE: 'ເບີໂທ',
    AMOUNT: 'ຈຳນວນເງິນ',
    PAYMENT_STATUS: 'ການຊຳລະ',
    CREATED_DATE: 'ວັນທີອອກໃບບິນ',
    UPDATED_DATE: 'ວັນທີແກ້ໄຂ',
    ACTIONS: 'ຈັດການ',
    ROW_NUMBER: 'ລຳດັບ',
  },

  // Placeholders
  PLACEHOLDERS: {
    SELECT_STATUS: 'ກະລຸນາເລືອກ',
    ENTER_CODE: 'ປ້ອນລະຫັດ.......',
    ENTER_PHONE: 'ປ້ອນເບີ.......',
    ENTER_NAME: 'ປ້ອນຊື່.......',
    ENTER_PRICE: 'ປ້ອນລາຄາ.......',
    SELECT_CURRENCY: 'ເລືອກສະກຸນເງິນ',
    SEARCH_PLACEHOLDER: 'ຄົ້ນຫາ...',
  },

  // Status options
  STATUS_OPTIONS: {
    AT_THAI_BRANCH: 'ສິນຄ້າຮອດໄທ',
    IN_TRANSIT: 'ສິ້ນຄ້າອອກຈາກໄທ',
    AT_LAO_BRANCH: 'ສິ້ນຄ້າຮອດລາວ',
    DELIVERED: 'ລູກຄ້າຮັບເອົາສິນຄ້າ',
  },

  // Currency options
  CURRENCY_OPTIONS: {
    LAK: 'ກີບ',
    THB: 'ບາດ',
  },

  // Service type options
  SERVICE_TYPE_OPTIONS: {
    SEND_MONEY: 'ສົ່ງເງິນ',
    SEND_PACKAGE: 'ສົ່ງຂອງ',
    SEND_DOCUMENT: 'ສົ່ງເອກະສານ',
    OTHER: 'ອື່ນໆ',
  },

  // Buttons
  BUTTONS: {
    RESET: 'ຣີເຊັດ',
    ADD_ITEM: 'ເພີ່ມລາຍການ',
    CANCEL: 'ຍົກເລີກ',
    APPROVE: 'ອະນຸມັດ',
    EDIT: 'ແກ້ໄຂ',
    DELETE: 'ລຶບ',
    SAVE: 'ບັນທຶກ',
    LOADING: 'ກຳລັງບັນທຶກ...',
  },

  // Messages
  MESSAGES: {
    LOADING_DATA: 'ກຳລັງໂຫຼດຂໍ້ມູນ...',
    NO_DATA: 'ບໍ່ພົບຂໍ້ມູນຄຳສັ່ງຊື້',
    NO_DATA_TABLE: 'ບໍ່ມີຂໍ້ມູນ',
    PAID: 'ຊຳລະແລ້ວ',
    UNPAID: 'ຍັງບໍ່ຊຳລະ',
    DELETE_CONFIRM: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?',
  },

  // Search and filter
  SEARCH: {
    SEARCH_LABEL: 'ຄົ້ນຫາ',
    STATUS_FILTER: 'ຟິນເຕີໂດຍສະຖານະ',
    ALL_STATUS: 'ທັງໝົດ',
    ITEMS_PER_PAGE: 'ລາຍການຕໍ່ໜ້າ',
  },

  // Required field indicator
  REQUIRED: '*',
} as const;

// Export individual sections for easier imports
export const LABELS = PRODUCT_TEXT.LABELS;
export const PLACEHOLDERS = PRODUCT_TEXT.PLACEHOLDERS;
export const STATUS_OPTIONS = PRODUCT_TEXT.STATUS_OPTIONS;
export const CURRENCY_OPTIONS = PRODUCT_TEXT.CURRENCY_OPTIONS;
export const SERVICE_TYPE_OPTIONS = PRODUCT_TEXT.SERVICE_TYPE_OPTIONS;
export const BUTTONS = PRODUCT_TEXT.BUTTONS;
export const MESSAGES = PRODUCT_TEXT.MESSAGES;
export const SEARCH = PRODUCT_TEXT.SEARCH;
