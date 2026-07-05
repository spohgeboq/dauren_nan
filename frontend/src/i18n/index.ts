import { useState, useEffect } from 'react';

export type Locale = 'ru' | 'kz';

type MessageTree = {
  [key: string]: string | MessageTree;
};

const messages: Record<Locale, MessageTree> = {
  ru: {
    common: {
      appName: 'Daurennan CRM',
      profile: 'Профиль',
      logout: 'Выйти',
      backToMenu: 'Назад в меню',
      mainMenu: 'Главное меню',
      loading: 'Загрузка...',
      activeSession: 'Сессия активна',
      language: 'Язык',
      all: 'Все',
      refresh: 'Обновить',
      cancel: 'Отмена',
      save: 'Сохранить',
    },
    roles: {
      admin: 'Администратор',
      baker: 'Пекарь',
      seller: 'Продавец',
      driver: 'Водитель',
      client: 'Клиент',
    },
    auth: {
      title: 'Вход в Daurennan CRM',
      subtitle: 'Пожалуйста, авторизуйтесь для доступа к системе',
      email: 'Email адрес',
      password: 'Пароль',
      submit: 'Войти',
      google: 'Войти через Google',
      or: 'или',
      loading: 'Вход...',
      tokenError: 'Ошибка входа: не получен токен',
      invalidCredentials: 'Неверный email или пароль',
      connectionError: 'Ошибка подключения к серверу',
      googleCallback: {
        loading: 'Вход через Google',
        loadingText: 'Проверяем аккаунт и открываем систему.',
        errorTitle: 'Не удалось войти через Google',
        backToLogin: 'Вернуться ко входу',
      },
      googleErrors: {
        google_auth_failed: 'Google не подтвердил вход. Попробуйте еще раз.',
        google_email_missing: 'Google не вернул email аккаунта.',
        account_inactive: 'Аккаунт деактивирован. Обратитесь к администратору.',
        missing_token: 'Backend не вернул token авторизации.',
        callback_failed: 'Не удалось завершить вход. Попробуйте еще раз.',
      },
    },
    applicant: {
      eyebrow: 'Кабинет заявителя',
      title: 'Здравствуйте, {name}',
      subtitle: 'Здесь отображается статус подключения к доставке. До утверждения администратором рабочие разделы CRM недоступны.',
      user: 'пользователь',
      statusTitle: 'Статус заявки',
      requestName: 'Клиент',
      requestPhone: 'Телефон',
      requestAddress: 'Адрес доставки',
      createRequest: 'Оставить заявку',
      refresh: 'Обновить статус',
      openCabinet: 'Открыть кабинет клиента',
      nextTitle: 'Что дальше',
      loadError: 'Не удалось загрузить статус заявки',
      status: {
        none: {
          title: 'Заявка еще не отправлена',
          text: 'Вы вошли через Google. Чтобы подключить доставку, отправьте заявку с адресом, телефоном и удобным временем доставки.',
        },
        pending: {
          title: 'Заявка ожидает проверки',
          text: 'Администратор проверит адрес, маршрут и условия. После утверждения вы получите доступ к кабинету клиента.',
        },
        approved: {
          title: 'Заявка утверждена',
          text: 'Подключение одобрено. Обновите доступ и перейдите в кабинет клиента.',
        },
        rejected: {
          title: 'Заявка отклонена',
          text: 'Администратор отклонил заявку. Свяжитесь с пекарней, чтобы уточнить причину или отправить новую заявку.',
        },
      },
      steps: {
        request: {
          title: 'Заявка',
          text: 'Вы отправляете контакты и адрес доставки.',
        },
        review: {
          title: 'Проверка',
          text: 'Администратор проверяет маршрут и условия.',
        },
        access: {
          title: 'Доступ',
          text: 'После утверждения открывается кабинет клиента.',
        },
      },
    },
    publicHome: {
      brandCaption: 'свежий хлеб с доставкой',
      login: 'Войти в систему',
      dashboard: 'Рабочее меню',
      badge: 'Ежедневная доставка для магазинов и организаций',
      title: 'Свежий хлеб на вашу точку каждое утро',
      subtitle: 'Подключите регулярную доставку хлеба и выпечки. Мы принимаем заявки от магазинов, кафе, организаций и постоянных клиентов, затем администратор подтверждает условия и включает вас в маршрут.',
      formEyebrow: 'Подключение доставки',
      formTitle: 'Оставьте заявку',
      formText: 'После отправки заявка попадет администратору. Мы проверим адрес, маршрут и свяжемся с вами для подключения.',
      submitting: 'Отправляем...',
      submit: 'Отправить заявку',
      submitError: 'Не удалось отправить заявку. Проверьте поля и попробуйте еще раз.',
      fields: {
        name: 'Название клиента',
        type: 'Тип клиента',
        phone: 'Телефон',
        contact: 'Контактное лицо',
        email: 'Email',
        address: 'Адрес доставки',
        time: 'Удобное время',
        comment: 'Комментарий',
      },
      placeholders: {
        name: 'Магазин Центральный',
        contact: 'ФИО',
        address: 'Город, улица, дом',
        time: 'Например: 07:00-09:00',
        comment: 'Ассортимент, объем, особые условия',
      },
      clientTypes: {
        store: 'Магазин',
        organization: 'Организация',
        regular: 'Постоянный клиент',
        retail: 'Розничный клиент',
      },
      metrics: {
        assortment: {
          value: '7-8',
          label: 'видов хлеба ежедневно',
        },
        delivery: {
          value: 'утром',
          label: 'доставка по маршрутам',
        },
        payments: {
          value: 'Kaspi/нал',
          label: 'удобная оплата',
        },
      },
      nav: {
        benefits: "Преимущества",
        catalog: "Каталог",
        request: "Заявка"
      },
      catalog: {
        eyebrow: 'Каталог продукции',
        title: 'Ассортимент свежей выпечки',
        subtitle: 'Выберите товары из каталога и оставьте заявку на подключение доставки.',
        fallback: {
          classic: {
            name: 'Хлеб классический',
          },
          rye: {
            name: 'Ржаной хлеб',
          },
          bun: {
            name: 'Сдобная булочка',
          },
          flatbread: {
            name: 'Лепешка тандырная',
          },
        },
      },
      benefits: {
        delivery: {
          title: 'Маршрутная доставка',
          text: 'Клиенты закрепляются за водителем, поставки и возвраты фиксируются в системе.',
        },
        fresh: {
          title: 'Свежая продукция',
          text: 'Выпечка учитывается по дате производства, чтобы товар сегодняшнего дня был виден отдельно.',
        },
        payment: {
          title: 'Оплата как удобно',
          text: 'Поддерживаются наличные, Kaspi, частичная оплата и контроль задолженности.',
        },
        control: {
          title: 'Прозрачный учет',
          text: 'Администратор видит поставки, возвраты, долги и историю работы с клиентом.',
        },
      },
      steps: {
        request: {
          number: 'Шаг 1',
          title: 'Заявка',
          text: 'Вы отправляете контактные данные, адрес и удобное время доставки.',
        },
        call: {
          number: 'Шаг 2',
          title: 'Проверка',
          text: 'Администратор уточняет условия, ассортимент и возможность маршрута.',
        },
        connect: {
          number: 'Шаг 3',
          title: 'Подключение',
          text: 'После утверждения вас добавляют как клиента и назначают доставку.',
        },
      },
    },
    deliveryRequestSent: {
      eyebrow: 'Заявка отправлена',
      title: 'Спасибо, мы приняли вашу заявку',
      text: 'Сейчас доступ в кабинет еще не открыт. Администратор проверит заявку, свяжется с вами и после утверждения подключит вас как клиента доставки.',
      home: 'На главную',
      login: 'Войти',
      steps: {
        review: {
          title: 'Проверка заявки',
          text: 'Администратор увидит ее в CRM.',
        },
        call: {
          title: 'Звонок',
          text: 'Мы уточним адрес, объемы и оплату.',
        },
        delivery: {
          title: 'Подключение',
          text: 'После утверждения вас добавят в маршрут.',
        },
      },
    },
    dashboard: {
      subtitle: 'Главное меню модулей системы',
      noModulesTitle: 'Нет доступных модулей',
      noModulesText: 'Для текущего пользователя не назначены права на разделы системы.',
      groups: {
        sales: 'Продажи и Клиенты',
        production: 'Склад и Производство',
        dictionaries: 'Справочники',
        management: 'Управление и Отчеты',
      },
      badges: {
        implemented: 'Реализовано',
        pwa: 'PWA Интерфейс',
        cabinet: 'Кабинет',
      },
      modules: {
        pos: {
          title: 'Касса (POS)',
          description: 'Розничные продажи, корзина, оплата Kaspi и наличными, списание складского остатка.',
        },
        products: {
          title: 'Товары',
          description: 'Управление товарами, загрузка картинок, цены и настройки.',
        },
        recipes: {
          title: 'Рецепты',
          description: 'Нормы сырья на продукт: мука, дрожжи, соль, вода и упаковка.',
        },
        production: {
          title: 'Производство',
          description: 'Ввод выпечки, списание сырья по рецептам и приход готовой продукции.',
        },
        rawMaterials: {
          title: 'Сырье',
          description: 'Мука, дрожжи, соль: базовые единицы, упаковки и коэффициенты пересчета.',
        },
        categories: {
          title: 'Категории',
          description: 'Управление разделами хлеба и выпечки.',
        },
        users: {
          title: 'Сотрудники',
          description: 'Пользователи системы и их контактные данные.',
        },
        roles: {
          title: 'Роли и доступы',
          description: 'Конструктор ролей. Гибкая настройка прав галочками.',
        },
        expenses: {
          title: 'Расходы',
          description: 'Аренда, зарплаты, ГСМ и прочие ежедневные расходы.',
        },
        purchases: {
          title: 'Закупки сырья',
          description: 'Заявки на муку/дрожжи и автоматическое пополнение склада.',
        },
        reports: {
          title: 'Аналитика и отчеты',
          description: 'Сводка за день, расходы, долги клиентов, отчеты по водителям.',
        },
        clients: {
          title: 'Клиенты',
          description: 'Магазины, организации, привязка к водителям, история переназначений, долги.',
        },
        deliveryRoutes: {
          title: 'Маршруты доставки',
          description: 'Создание маршрута, выдача товара водителю и контроль доставок.',
        },
        driver: {
          title: 'Доставка (Водитель)',
          description: 'Маршруты, долги клиентов, возвраты хлеба.',
        },
        clientPortal: {
          title: 'Кабинет клиента',
          description: 'История поставок, оплаты, долг и заявки на повторный заказ.',
        },
      },
    },
    profile: {
      title: 'Профиль аккаунта',
      subtitle: 'Данные текущего пользователя и доступы',
      roles: 'Роли',
      noRoles: 'Нет ролей',
      status: 'Статус',
      active: 'Активен',
      inactive: 'Деактивирован',
      quickLinks: 'Быстрый переход',
      adminMenu: 'Админ меню',
      pos: 'Касса',
      route: 'Маршрут',
      clientCabinet: 'Кабинет клиента',
      loadError: 'Не удалось загрузить профиль',
    },
    production: {
      breadcrumb: 'Производство',
      title: 'Выпечено',
      recipes: 'Рецепты',
      reports: 'Отчеты',
      date: 'Дата',
      status: 'Статус',
      total: 'Итого',
      product: 'Товар',
      plan: 'План',
      baked: 'Выпечено',
      chooseProduct: 'Выберите товар',
      addRow: 'Добавить строку',
      saveDraft: 'Сохранить черновик',
      saveProduction: 'Провести на склад',
      finalizeDraft: 'Провести черновик на склад',
      saving: 'Сохранение...',
      draftSaved: 'Черновик производства сохранен',
      draftUpdated: 'Черновик производства обновлен',
      draftLoaded: 'Черновик загружен в форму',
      draftFinalized: 'Черновик проведен на склад: {quantity} шт',
      productionSaved: 'Выпуск проведен на склад: {quantity} шт',
      loadError: 'Не удалось загрузить производство',
      saveError: 'Не удалось сохранить выпуск',
      editingDraft: 'Редактирование черновика #{id}',
      editingDraftHint: 'Проведите его на склад, когда фактический выпуск проверен.',
      cancelEdit: 'Отменить',
      editDraft: 'Открыть черновик',
      latestBatches: 'Последние партии',
      records: '{count} записей',
      refresh: 'Обновить',
      noBatches: 'Партий пока нет',
      batch: 'Партия #{id}',
      baker: 'Пекарь',
      ingredients: 'Сырье',
      pieces: 'шт',
      deleteRow: 'Удалить строку',
      mainMenu: 'В главное меню',
      menu: 'В меню',
      cancelBatch: 'Отменить партию',
      deleteBatch: 'Удалить партию',
      confirmCancel: 'Вы уверены, что хотите отменить эту партию? Готовая продукция будет списана, а сырье возвращено на склад.',
      confirmDelete: 'Вы уверены, что хотите безвозвратно удалить эту партию?',
      cancelledSuccess: 'Партия успешно отменена',
      deletedSuccess: 'Партия удалена',
      cancelError: 'Не удалось отменить партию',
      deleteError: 'Не удалось удалить партию',
      copyPrevious: 'Заполнить по вчерашнему',
      templateLoaded: 'Ассортимент успешно скопирован',
      noTemplateFound: 'Предыдущих партий не найдено',
      cancelModal: {
        eyebrow: 'Контроль склада',
        title: 'Отменить партию #{id}',
        text: 'Система откатит проведенное производство: вернет сырье на склад и спишет готовую продукцию этой даты.',
        date: 'Дата партии',
        status: 'Текущий статус',
        quantity: 'Количество',
        products: 'Продукция в партии',
        warning: 'Отмена возможна только если готовая продукция еще есть на складе. Если товар уже продан или выдан водителю, backend остановит операцию.',
        keep: 'Оставить партию',
        confirm: 'Да, отменить партию',
        processing: 'Выполняем...',
      },
      deleteModal: {
        eyebrow: 'Удаление записи',
        title: 'Удалить партию #{id}',
        text: 'Будет удалена запись партии, ее товары и расчет сырья. Это действие доступно только для черновиков и уже отмененных партий.',
        warning: 'Удаление необратимо. Если нужно откатить проведенную на склад партию, сначала используйте отмену партии.',
        confirm: 'Да, удалить',
      },
      statuses: {
        draft: 'Черновик',
        confirmed: 'Подтверждено',
        closed: 'Проведено',
        cancelled: 'Отменено',
      },
    },
    pos: {
      backTitle: 'В главное меню',
      backShort: 'В меню',
      receipt: 'Чек',
      history: 'История',
      closeShift: 'Закрыть смену',
      shiftShort: 'Смена',
      cashier: 'Касса',
      owner: 'Владелец',
      cashierEmployee: 'Сотрудник кассы',
      shiftChecking: 'Проверка смены',
      shiftOpenCaption: 'Смена открыта · {amount} ₸ на начало',
      shiftNeedsCloseCaption: 'Не закрыта смена за {date}',
      shiftClosed: 'Смена закрыта',
      shiftNotOpen: 'Смена не открыта',
      openShiftTitle: 'Откройте смену',
      previousShiftClosed: 'Предыдущая смена закрыта. Введите наличные, которые сейчас лежат в кассе.',
      previousShiftOpenTitle: 'Закройте прошлую смену',
      previousShiftOpenHint: 'Открытая смена за {date} блокирует новую смену. Закройте ее, затем откройте сегодняшнюю.',
      previousShiftOpeningCash: 'На начало смены',
      openShiftHint: 'Перед продажами нужно зафиксировать начальные наличные в кассе.',
      openingCash: 'Наличные в кассе на начало',
      opening: 'Открытие...',
      openShift: 'Открыть смену',
      allProducts: 'Все товары',
      saleSuccessTitle: 'Чек успешно пробит',
      saleSaved: 'Продажа сохранена',
      receiptNumber: 'Чек #{id}',
      amount: 'Сумма',
      payment: 'Оплата',
      closeNotification: 'Закрыть уведомление',
      shortage: 'Недостача: {amount} ₸',
      noShortage: 'Недостачи нет',
      checkShiftError: 'Не удалось проверить смену',
      openShiftError: 'Не удалось открыть смену',
      payments: {
        cash: 'Наличные',
        kaspi: 'Kaspi',
        mixed: 'Смешанная',
        debt: 'В долг',
      },
      cart: {
        title: 'Текущий чек',
        clear: 'Очистить',
        empty: 'Корзина пуста',
        perPiece: '₸ / шт',
        totalDue: 'К оплате:',
        pay: 'Оплатить',
      },
      product: {
        unavailable: 'Нет на складе',
        pcs: 'шт',
      },
      paymentModal: {
        title: 'Оплата чека',
        totalDue: 'Итого к оплате',
        chooseMethod: 'Выберите способ оплаты',
        mixed: 'Смешанная оплата (Наличные + Kaspi)',
        cash: 'Наличные:',
        remaining: 'Остаток к распределению:',
        erase: 'Стереть',
        clear: 'Очистить',
        submit: 'Пробить чек',
        submitting: 'Пробиваем...',
        allCashPreset: 'Нал.',
        invalidSplit: 'Сумма распределена неверно.',
        submitError: 'Ошибка при проведении оплаты. Проверьте складские остатки.',
      },
      historyPanel: {
        title: 'История чеков',
        count: '{count} чеков на дату',
        refresh: 'Обновить',
        total: 'Сумма',
        empty: 'Чеков нет',
        product: 'Товар',
      },
      closeModal: {
        titleSmall: 'Кассовая смена',
        title: 'Закрытие смены',
        shiftDate: 'Дата смены: {date}',
        closeWindow: 'Закрыть окно',
        shiftStart: 'Начало смены',
        sales: 'Продажи',
        expectedCash: 'Ожидаемые наличные',
        expectedKaspi: 'Ожидаемый Kaspi',
        actualAmounts: 'Фактические суммы',
        actualHint: 'Введите деньги, которые реально есть при закрытии.',
        fillExpected: 'Заполнить ожиданием',
        expected: 'Ожидаемое',
        input: 'Ввод: {field}',
        closing: 'Закрытие...',
        summary: 'Расшифровка смены',
        receiptCount: 'Чеков',
        cashSales: 'Наличные продажи',
        kaspiSales: 'Kaspi продажи',
        cashDrawer: 'Касса к сдаче',
        explanation: 'Наличные считаются вместе с деньгами, которые были в кассе на начало смены. Kaspi сверяется отдельно по переводам.',
        productCheck: 'Продажи по товарам',
        noProductsIssued: 'Продаж по товарам нет',
        sold: 'Продано',
        product: 'Товар',
        loadError: 'Не удалось загрузить продажи смены',
        closeError: 'Не удалось закрыть смену',
      },
      keypad: {
        erase: 'Стереть',
        clear: 'Очистить',
      },
    },
    layout: {
      route: 'Маршрут',
      driver: 'Водитель',
      exit: 'Выход',
      deliveries: 'Доставки',
      returns: 'Возвраты',
      cabinet: 'Кабинет',
      client: 'Клиент',
      overview: 'Обзор',
      orders: 'Заявки',
      history: 'История',
      payments: 'Оплаты',
      profile: 'Профиль',
    },
    routerTitles: {
      driverRoute: 'Мой маршрут',
      driverDeliveryCreate: 'Создание доставки',
      driverReturns: 'Возвраты',
      clientDashboard: 'Кабинет клиента',
      clientOrders: 'Заявки',
      clientHistory: 'История поставок',
      clientPayments: 'Оплаты и долг',
      clientProfile: 'Профиль',
    },
    adminRoles: {
      breadcrumb: 'Роли и Доступы',
      title: 'Управление Доступами',
      createRole: 'Создать роль',
      system: 'System',
      assignedPermissions: 'Назначенные права',
      noPermissions: 'Нет прав',
      configureAccess: 'Настроить доступы',
      fullAccess: 'Полный доступ',
      delete: 'Удалить',
      confirmDelete: 'Удалить роль {name}?',
      loadError: 'Ошибка загрузки данных',
      saveError: 'Ошибка сохранения роли',
      deleteError: 'Ошибка удаления',
    },
    updater: {
      updateAvailable: 'Доступно обновление',
      updateAvailableDesc: 'Новая версия {version} готова к скачиванию. Обновить сейчас?',
      downloading: 'Загрузка обновления...',
      downloadingDesc: 'Пожалуйста, подождите, пока файл загрузится.',
      downloaded: 'Обновление готово',
      downloadedDesc: 'Новая версия загружена и готова к установке. Приложение будет перезапущено.',
      error: 'Ошибка обновления',
      downloadBtn: 'Скачать',
      installBtn: 'Перезапустить и обновить',
      cancelBtn: 'Позже',
    },
    adminUsers: {
      breadcrumb: 'Сотрудники',
      title: 'Сотрудники и Доступы',
      createUser: 'Добавить сотрудника',
      searchPlaceholder: 'Поиск по имени или email...',
      allRoles: 'Все роли',
      emptyState: 'Сотрудники не найдены',
      columns: {
        nameAndContacts: 'Имя и Контакты',
        roleAndAccess: 'Роль (Доступ)',
        actions: 'Действия',
      },
      noRole: 'Без роли',
      edit: 'Редактировать',
      delete: 'Удалить',
      confirmDelete: 'Вы действительно хотите удалить сотрудника {name}?',
      loadError: 'Ошибка загрузки данных',
      saveError: 'Ошибка сохранения сотрудника',
      deleteError: 'Ошибка удаления',
      bakerProducts: {
        title: 'Товары пекаря',
        hint: 'Пекарь сможет добавлять в производство только выбранные товары.',
        empty: 'Активных товаров пока нет',
        required: 'Выберите хотя бы один товар для пекаря',
        none: 'Товары не закреплены',
        assigned: 'Закреплено: {count}. {products}',
      },
      deliveryStockMode: {
        title: 'Списание товара для доставки',
        hint: 'Настройка применяется только к водителям.',
        warehouse: {
          title: 'Сразу со склада',
          text: 'Водитель оформляет доставку без предварительной выдачи товара. Остаток списывается со склада при сохранении доставки.',
        },
        driverTransfer: {
          title: 'По выдаче водителю',
          text: 'Сначала администратор выдает товар водителю, затем доставка списывается из остатка машины.',
        },
      },
    },
    adminCategories: {
      breadcrumb: 'Категории',
      title: 'Справочник Категорий',
      addCategory: 'Добавить категорию',
      noDescription: 'Без описания',
      edit: 'Редактировать',
      delete: 'Удалить',
      confirmDelete: 'Удалить категорию {name}? Убедитесь, что в ней нет товаров.',
      loadError: 'Ошибка загрузки данных',
      saveError: 'Ошибка сохранения категории',
      deleteError: 'Ошибка удаления. Возможно, категория не пуста.',
    },
    adminProducts: {
      breadcrumb: 'Товары',
      title: 'Каталог продукции',
      recipesBtn: 'Рецепты сырья',
      addProduct: 'Добавить товар',
      emptyTitle: 'Нет товаров',
      emptyText: 'Каталог пуст. Добавьте ваш первый хлеб или выпечку.',
      startAdding: 'Начать добавление →',
      inactive: 'Неактивен',
      edit: '✏️ Редактировать',
      recipe: '📋 Рецепт',
      noCategory: 'Без категории',
      retail: 'Розница',
      wholesale: 'Опт (Доставка)',
      loadError: 'Ошибка загрузки данных',
      saveError: 'Ошибка сохранения товара',
    },
    adminRecipes: {
      breadcrumb: 'Рецепты',
      title: 'Рецепты продукции',
      rawMaterialsBtn: 'Сырье',
      productsBtn: 'Товары',
      newRecipe: 'Новый рецепт',
      withoutRecipe: 'Без рецепта: {products}. Для этих товаров производство не сможет рассчитать списание сырья.',
      emptyTitle: 'Нет рецептов',
      emptyText: 'Добавьте нормы сырья для товаров, чтобы производство автоматически списывало склад.',
      createFirstRecipe: 'Создать первый рецепт',
      deletedProduct: 'Удаленный товар',
      active: 'Активен',
      inactive: 'Выключен',
      normFor: 'Норма на {quantity} {unit}',
      edit: 'Редактировать',
      delete: 'Удалить',
      deletedRawMaterial: 'Удаленное сырье',
      writeOffInfo: 'Списывается при подтверждении производства',
      loadError: 'Ошибка загрузки рецептов',
      saveError: 'Ошибка сохранения рецепта',
      confirmDelete: 'Удалить рецепт для "{name}"? Производство перестанет списывать сырье по этому товару.',
      deleteError: 'Ошибка удаления рецепта',
    },
    adminRawMaterials: {
      breadcrumb: 'Сырье',
      title: 'Справочник сырья',
      recipesBtn: 'Рецепты',
      addMaterial: 'Добавить сырье',
      emptyTitle: 'Нет сырья',
      emptyText: 'Добавьте муку, дрожжи, соль, воду или упаковку.',
      createFirstMaterial: 'Создать первое сырье',
      columns: {
        material: 'Сырье',
        conversion: 'Конвертация',
        stock: 'Остатки',
        supplier: 'Поставщик',
        actions: 'Действия',
      },
      active: 'Активно',
      inactive: 'Выключено',
      inRecipes: 'В рецептах: {unit}',
      conversionRule: '1 {purchaseUnit} = {qty} {unit}',
      purchaseIn: 'Закупка: {purchaseUnit}',
      minStock: 'мин. {qty} {unit}',
      recStock: 'рек. {qty} {unit}',
      notSpecified: 'Не указан',
      edit: 'Редактировать',
      delete: 'Удалить',
      loadError: 'Ошибка загрузки сырья',
      saveError: 'Ошибка сохранения сырья',
      confirmDelete: 'Удалить сырье "{name}"? Если оно используется в рецептах или движениях склада, удаление может быть запрещено.',
      deleteError: 'Ошибка удаления сырья',
    },
    adminClients: {
      breadcrumb: 'Клиенты',
      title: 'Управление Клиентами',
      addClient: 'Добавить клиента',
      tabs: {
        clients: 'Клиенты ({count})',
        transfers: '🔄 История переназначений ({count})',
        requests: 'Заявки доставки ({count})',
      },
      columns: {
        client: 'Клиент',
        type: 'Тип',
        contacts: 'Контакты',
        account: 'Аккаунт',
        driver: 'Водитель',
        debtLimit: 'Долг / Лимит',
        status: 'Статус',
        actions: 'Действия',
        oldDriver: 'Старый водитель',
        newDriver: 'Новый водитель',
        period: 'Период',
        reason: 'Причина',
        approver: 'Утвердил',
      },
      clientTypes: {
        store: 'Магазин',
        organization: 'Организация',
        regular: 'Постоянный клиент',
        retail: 'Розничный клиент',
      },
      notAssigned: 'Не привязан',
      noDriver: 'Не назначен',
      debt: 'Долг',
      limit: 'лимит: {amount} ₸',
      active: 'Активен',
      inactive: 'Неактивен',
      pay: '💰 Погасить',
      transfer: '🔄 Переназ.',
      edit: 'Изменить',
      delete: 'Удалить',
      emptyClients: 'Клиентов пока нет.',
      emptyTransfers: 'Переназначений пока не было.',
      emptyRequests: 'Заявок на подключение пока нет.',
      approveAndCreate: 'Утвердить и создать клиента',
      reject: 'Отклонить',
      clientNumber: 'Клиент #{id}',
      modal: {
        editTitle: 'Редактировать клиента',
        newTitle: 'Новый клиент',
        name: 'Название *',
        type: 'Тип *',
        account: 'Аккаунт личного кабинета',
        phone: 'Телефон',
        contactPerson: 'Контактное лицо',
        address: 'Адрес',
        assignDriver: 'Назначить водителя',
        debtLimit: 'Лимит долга (₸)',
        isActive: 'Активен',
        cancel: 'Отмена',
        save: 'Сохранить',
        create: 'Создать',
        saving: 'Сохранение...',
        transferTitle: 'Переназначить водителя',
        client: 'Клиент:',
        newDriver: 'Новый водитель *',
        selectDriver: '— Выберите водителя —',
        dateFrom: 'Дата с *',
        dateTo: 'Дата по',
        reason: 'Причина',
        reasonPlaceholder: 'Водитель заболел / машина в ремонте...',
        transferBtn: 'Переназначить',
        paymentTitle: 'Погашение долга',
        amount: 'Сумма к оплате (₸) *',
        currentDebt: 'Текущий долг: {amount} ₸',
        paymentMethod: 'Способ оплаты *',
        cash: 'Наличные',
        kaspi: 'Kaspi Перевод',
        mixed: 'Смешанная оплата',
        comment: 'Комментарий',
        commentPlaceholder: 'Например: Перевод от директора',
        acceptPayment: 'Принять оплату',
        waiting: 'Ожидайте...',
      },
      errors: {
        load: 'Ошибка загрузки данных',
        enterName: 'Введите название клиента',
        save: 'Ошибка сохранения',
        selectNewDriver: 'Выберите нового водителя',
        enterDateFrom: 'Укажите дату начала',
        transfer: 'Ошибка переназначения',
        confirmDelete: 'Удалить клиента "{name}"?',
        delete: 'Ошибка удаления',
        confirmApprove: 'Утвердить заявку "{name}" и создать клиента?',
        approve: 'Ошибка утверждения заявки',
        confirmReject: 'Отклонить заявку "{name}"?',
        reject: 'Ошибка отклонения заявки',
        enterAmount: 'Введите корректную сумму',
        amountExceedsDebt: 'Сумма не может превышать текущий долг',
        payment: 'Ошибка проведения оплаты',
      },
      requests: {
        new: 'Новая',
        approved: 'Утверждена',
        rejected: 'Отклонена',
        phone: 'Телефон:',
        email: 'Email:',
        address: 'Адрес:',
        contact: 'Контакт:',
        time: 'Время:',
        date: 'Дата заявки:',
      }
    },
    adminRoutes: {
      title: 'Маршруты доставки',
      description: 'Создание маршрута, выдача товара водителю и контроль точек доставки',
      date: 'Дата маршрута',
      driver: 'Водитель',
      selectDriver: 'Выберите водителя',
      waybill: 'Путевой лист',
      summarySelectDriver: 'Выберите водителя для создания или просмотра маршрута.',
      summaryNotCreated: 'Маршрут на выбранную дату еще не создан.',
      summaryCreated: 'Маршрут #{id} на {date}',
      createRoute: 'Создать маршрут',
      closeRoute: 'Закрыть маршрут',
      active: 'Активен',
      closed: 'Закрыт',
      deliveryPoints: 'Точки доставки',
      pointsDescription: 'Клиенты, закрепленные за выбранным водителем',
      noDriverSelected: 'Выберите водителя.',
      noClients: 'У водителя нет закрепленных клиентов. Назначьте клиентов в разделе «Клиенты».',
      noAddress: 'Адрес не указан',
      delivered: 'Доставлено',
      pending: 'Ожидает',
      debt: 'Долг: {amount} ₸',
      orderBadge: 'Заявка #{id}: {amount} ₸',
      createDelivery: 'Создать доставку',
      createDeliveryFromOrder: 'Доставка по заявке',
      stockInCar: 'Товар в машине',
      carEmpty: 'Машина пуста.',
      product: 'Товар',
      pieces: '{amount} шт',
      giveProduct: 'Выдать товар',
      selectProduct: 'Выберите товар со склада',
      productAvailable: '{name} — доступно {amount} шт',
      quantity: 'Количество',
      giveToDriver: 'Выдать водителю',
      copyYesterday: 'Заполнить по вчерашней выдаче',
      confirmTemplate: 'Выдать водителю тот же набор товаров, что и в прошлый раз?',
      stockModeWarehouseTitle: 'Списание идет со склада',
      stockModeWarehouseText: 'Для этого водителя выдача товара в машину отключена. При оформлении доставки товар будет списан напрямую из складского остатка.',
      errors: {
        create: 'Не удалось создать маршрут.',
        confirmClose: 'Закрыть маршрут? После закрытия водитель не сможет оформлять доставки и возвраты по этому маршруту.',
        close: 'Не удалось закрыть маршрут.',
        transfer: 'Не удалось выдать товар водителю.'
      }
    },
    adminExpenses: {
      breadcrumb: 'Расходы',
      title: 'Учет Расходов',
      typeDirectory: 'Справочник типов',
      addExpense: 'Добавить расход',
      columns: {
        date: 'Дата',
        type: 'Тип расхода',
        employeeVehicle: 'Сотрудник / Авто',
        comment: 'Комментарий',
        receipt: 'Чек',
        author: 'Автор',
        amount: 'Сумма',
        actions: 'Действия',
      },
      receiptBtn: '📄 Чек',
      delete: 'Удалить',
      empty: 'Расходов пока нет.',
      errors: {
        load: 'Ошибка загрузки данных',
        save: 'Ошибка сохранения',
        confirmDelete: 'Вы действительно хотите удалить расход на сумму {amount}?',
        delete: 'Ошибка удаления'
      },
      modals: {
        newExpense: 'Новый расход',
        date: 'Дата',
        type: 'Тип расхода',
        selectCategory: 'Выберите категорию',
        employee: 'Сотрудник (необязательно)',
        noEmployee: 'Без привязки к сотруднику',
        vehicle: 'Автомобиль (необязательно)',
        noVehicle: 'Без привязки к авто',
        noLicensePlate: 'Без номера',
        amount: 'Сумма (тг)',
        receipt: 'Фото чека / Вложение',
        comment: 'Комментарий',
        commentPlaceholder: 'Покупка чистящих средств...',
        errors: {
          fillRequired: 'Заполните обязательные поля'
        }
      }
    },
    adminExpenseTypes: {
      breadcrumb: 'Типы Расходов',
      title: 'Справочник Типов Расходов',
      addType: 'Добавить тип',
      errors: {
        save: 'Ошибка сохранения',
        confirmDelete: 'Удалить тип "{name}"? Это невозможно, если к нему привязаны расходы.',
        delete: 'Ошибка удаления. Скорее всего, тип уже используется в расходах.'
      },
      modals: {
        editType: 'Редактировать тип',
        newType: 'Новый тип расхода',
        name: 'Название (например: Аренда)',
        errors: {
          fillName: 'Заполните название'
        }
      }
    },
    adminPurchases: {
      breadcrumb: 'Закупки',
      title: 'Заявки на сырье',
      newRequest: 'Новая заявка',
      columns: {
        idDate: 'ID / Дата',
        rawMaterial: 'Сырье',
        purchaseStock: 'Закупка / склад',
        status: 'Статус',
        actions: 'Действия',
      },
      units: {
        pack: 'уп.',
        unit: 'ед.',
      },
      approve: 'Одобрить',
      reject: 'Отклонить',
      receive: 'Получить на склад',
      empty: 'Заявок пока нет.',
      statuses: {
        draft: 'Черновик',
        pending_approval: 'На утверждении',
        approved: 'Одобрено',
        rejected: 'Отклонено',
        received: 'Получено',
      },
      errors: {
        load: 'Ошибка загрузки данных',
        save: 'Ошибка создания заявки',
        confirmDelete: 'Удалить заявку #{id}?',
        delete: 'Ошибка удаления',
        confirmReceive: 'Сырье будет пересчитано из упаковок в базовые единицы и добавлено на склад. Продолжить?',
        actionError: 'Ошибка выполнения действия {action}'
      },
      modals: {
        newRequest: 'Новая заявка на закупку',
        expectedDate: 'Ожидаемая дата',
        rawMaterial: 'Сырье',
        selectRawMaterial: 'Выберите сырье...',
        quantity: 'Количество закупочных единиц',
        estimatedPrice: 'Цена за закупочную единицу (опционально, тг)',
        stockReceivePreview: 'На склад поступит',
        previewHelper: 'Выберите сырье и количество, чтобы увидеть пересчет.',
        pack: 'уп.',
        unit: 'ед.',
        errors: {
          fillRequired: 'Заполните сырье и количество'
        }
      }
    },
    adminReports: {
      breadcrumb: 'Аналитика',
      title: 'Единый Центр Отчетов',
      tabs: {
        daily: 'Сводка за день',
        production: 'Производство',
        inventory: 'Склад',
        expenses: 'Расходы',
        clients: 'Клиенты',
        drivers: 'Водители',
        employees: 'Сотрудники'
      },
      expense: {
        title: 'Отчет по расходам',
        from: 'От:',
        to: 'До:',
        total: 'Всего: {amount} ₸',
        byCategory: 'Расходы по категориям',
        columns: {
          date: 'Дата',
          category: 'Категория',
          comment: 'Комментарий',
          employee: 'Сотрудник',
          amount: 'Сумма (₸)'
        },
        filters: {
          search: 'Поиск (сотрудник, комментарий)',
          allCategories: 'Все категории',
          allEmployees: 'Все сотрудники',
          allVehicles: 'Все автомобили',
          sortBy: 'Сортировка',
          sortByDate: 'По дате',
          sortByAmount: 'По сумме',
          sortAsc: '↑ По возрастанию',
          sortDesc: '↓ По убыванию',
          found: 'Найдено: {count} расх.',
          activeFilters: '{count} фильтр',
          apply: 'Найти',
          reset: 'Сбросить'
        },
        other: 'Другое',
        empty: 'За выбранный период расходов не было.'
      },
      intervals: {
        day: 'День',
        week: 'Неделя',
        month: 'Месяц',
        year: 'Год',
        custom: 'Произвольный'
      },
      daily: {
        title: 'Сводки',
        date: 'Дата',
        metrics: {
          baked: 'Выпечено (шт)',
          retail: 'Розница (₸)',
          deliveries: 'Доставки (₸)',
          expenses: 'Расходы (₸)'
        },
        productControl: {
          title: 'Контроль товара',
          baked: 'Выпечено:',
          retailSold: 'Продано в розницу:',
          delivered: 'Доставлено клиентам:',
          returned: 'Возврат:',
          stock: 'Остаток:',
          writeOff: 'Списание:',
          shortage: 'Недостача товара:'
        },
        moneyControl: {
          title: 'Контроль денег',
          cash: 'Наличные:',
          kaspi: 'Kaspi Перевод:',
          debt: 'Долги клиентов:',
          shortage: 'Денежная недостача:',
          total: 'Итого приход:'
        }
      },
      clients: {
        title: 'Подробный отчет по клиентам',
        period: 'Период: {from} - {to}',
        columns: {
          client: 'Клиент',
          phone: 'Телефон',
          accepted: 'Принял',
          paid: 'Оплатил',
          debt: 'Долг',
          returns: 'Возвраты',
          bonuses: 'Бонусы',
          details: 'Детали',
          amount: 'Сумма',
          returnAmount: 'Сумма возврата',
        },
        metrics: {
          accepted: 'Принято товара',
          paid: 'Оплачено',
          currentDebt: 'Текущий долг',
          newDebt: 'Новый долг',
          returns: 'Возвраты'
        },
        filters: {
          name: 'Поиск по имени',
          phone: 'Поиск по телефону',
          allDebt: 'Все клиенты',
          withDebt: 'С долгом',
          withoutDebt: 'Без долга',
          allTypes: 'Все типы',
          typeStore: 'Магазин',
          typeOrganization: 'Организация',
          typeRetail: 'Розничный',
          typeRegular: 'Постоянный',
          allDrivers: 'Все водители',
          sortBy: 'Сортировка',
          sortByName: 'По имени',
          sortByDebt: 'По долгу',
          sortByAmount: 'По сумме',
          sortAsc: '↑ По возрастанию',
          sortDesc: '↓ По убыванию',
          found: 'Найдено: {count} кл.',
          activeFilters: '{count} фильтр',
          apply: 'Найти',
          reset: 'Сбросить'
        },
        details: {
          open: 'Открыть детали',
          back: 'К отчету клиентов',
          notFound: 'Клиент не найден в отчете за выбранный период.',
          clientInfo: 'Данные клиента',
          driver: 'Водитель',
          address: 'Адрес',
          debtLimit: 'Лимит долга',
          deliveries: 'Поставки',
          debtPayments: 'Погашения долга',
          product: 'Товар',
          returnedProduct: 'Возврат {product}: {quantity}'
        },
        loyalty: {
          title: 'Лояльность',
          balanceTotal: 'Всего бонусов у выбранных клиентов: {amount}',
          enabled: 'Включена',
          bonusPercent: '% начисления',
          redeemRate: 'Курс бонуса',
          maxPerOrder: 'Макс. за заказ',
          credit: 'Начислить',
          debit: 'Списать',
          adjustment: 'Корректировка',
          amount: 'Сумма бонусов',
          comment: 'Комментарий',
          submit: 'Сохранить бонусы',
          history: 'История бонусов',
          error: 'Не удалось сохранить бонусы',
          types: {
            manual_credit: 'Ручное начисление',
            manual_debit: 'Ручное списание',
            adjustment: 'Корректировка',
            earned: 'Начислено автоматически',
            redeemed: 'Списано'
          }
        },
        status: {
          pending: 'Ожидает',
          delivered: 'Доставлено',
          cancelled: 'Отменено'
        },
        paymentMethods: {
          cash: 'Наличные',
          kaspi: 'Kaspi',
          mixed: 'Смешанная',
          debt: 'В долг'
        },
        empty: 'За выбранный период данных нет.'
      },
      drivers: {
        title: 'Сводка по водителям',
        selectDriver: 'Водитель:',
        selectDriverPlaceholder: 'Выберите водителя...',
        date: 'Дата:',
        emptyState: 'Выберите водителя из списка для просмотра его отчета.',
        metrics: {
          received: 'Получено хлеба (шт)',
          delivered: 'Доставлено (шт)',
          returned: 'Возврат (шт)'
        },
        money: {
          title: 'Сборы денег',
          cash: 'Наличные',
          kaspi: 'Kaspi',
          debt: 'В долг (клиентам)',
          shortage: 'Недостача водителя'
        },
        shortage: {
          title: 'Недостача по товарам',
          columns: {
            product: 'Товар',
            received: 'Получил',
            delivered: 'Доставил',
            returned: 'Вернул',
            stock: 'Остаток',
            shortage: 'Недостача'
          },
          pieces: 'шт',
          defaultProduct: 'Товар'
        }
      },
      employees: {
        title: 'Детальный отчет по сотрудникам',
        period: 'Период: {from} - {to}',
        backToEmployees: 'К отчету сотрудников',
        notFound: 'Сотрудник не найден в отчете за выбранный период.',
        empty: 'За выбранный период данных нет.',
        noProducts: 'Нет товаров',
        defaultProduct: 'Товар',
        defaultClient: 'Клиент',
        metrics: {
          produced: 'Произвели пекари (шт)',
          delivered: 'Доставили водители (шт)',
          returned: 'Возвраты (шт)',
          shortage: 'Недостача товара',
          deliveryAmount: 'Сумма доставок',
          cash: 'Принято наличными',
          kaspi: 'Принято Kaspi',
          accepted: 'Принято всего',
          debt: 'Осталось в долг'
        },
        bakers: {
          title: 'Пекари',
          count: 'Сотрудников: {count}'
        },
        drivers: {
          title: 'Водители',
          count: 'Сотрудников: {count}'
        },
        filters: {
          allRoles: 'Все роли',
          allEmployees: 'Все сотрудники',
          bakers: 'Пекари',
          drivers: 'Водители',
          baker: 'Пекарь',
          driver: 'Водитель',
          reset: 'Сбросить'
        },
        columns: {
          employee: 'Сотрудник',
          batches: 'Партии',
          produced: 'Произвел',
          products: 'Товары',
          details: 'Детали',
          routes: 'Маршруты',
          deliveries: 'Доставки',
          received: 'Получил',
          delivered: 'Доставил',
          returned: 'Возврат',
          remaining: 'Остаток',
          amount: 'Сумма',
          cash: 'Наличные',
          kaspi: 'Kaspi',
          accepted: 'Принято',
          debt: 'Долг',
          shortage: 'Недостача'
        },
        details: {
          open: 'Открыть детали',
          planned: 'План',
          actual: 'Факт',
          products: 'Сверка товаров',
          productionBatches: 'Партии производства',
          deliveries: 'Детали доставок',
          returnedProduct: 'Возврат {product}: {quantity}'
        },
        status: {
          draft: 'Черновик',
          confirmed: 'Подтверждено',
          closed: 'Закрыто',
          cancelled: 'Отменено',
          pending: 'Ожидает',
          delivered: 'Доставлено',
          active: 'Активно'
        }
      },
      inventory: {
        title: 'Остатки на складах',
        writeOff: {
          title: 'Списание готовой продукции',
          description: 'Списание пройдет через движение склада и попадет в ежедневную сверку.',
          button: 'Списать',
          loading: 'Списание...',
          product: 'Товар',
          selectProduct: 'Выберите товар',
          stock: 'остаток',
          quantity: 'Количество',
          reason: 'Причина',
          reasons: {
            stale: 'Вчерашний товар',
            damaged: 'Брак/повреждение',
            shortage: 'Недостача',
            other: 'Другое'
          },
          date: 'Дата',
          commentPlaceholder: 'Комментарий',
          success: 'Списание сохранено',
          error: 'Не удалось сохранить списание'
        },
        products: {
          title: '🥖 Готовая продукция',
          columns: {
            product: 'Товар и возраст',
            stock: 'Остаток'
          },
          empty: 'Склад готовой продукции пуст',
          pieces: 'шт'
        },
        freshness: {
          fresh: 'Свежий',
          expiringToday: 'Истекает сегодня',
          expired: 'Просрочено'
        },
        rawMaterials: {
          title: '🌾 Сырье',
          columns: {
            material: 'Сырье',
            stock: 'Остаток'
          },
          empty: 'Склад сырья пуст',
          low: 'Мало'
        }
      },
      production: {
        title: 'Отчет по производству',
        from: 'От:',
        to: 'До:',
        produced: {
          title: 'Выпущено продукции',
          columns: {
            product: 'Товар',
            quantity: 'Произведено (шт)'
          },
          deleted: 'Удаленный товар',
          empty: 'Нет данных о производстве за этот период',
          pieces: 'шт'
        },
        consumed: {
          title: 'Расход сырья',
          columns: {
            material: 'Сырье',
            quantity: 'Потрачено'
          },
          deleted: 'Удаленное сырье',
          empty: 'Нет данных о расходе сырья за этот период',
        }
      }
    },
    clientPortal: {
      dashboard: {
        currentDebt: 'Текущий долг',
        limit: 'Лимит: {amount} ₸',
        newOrder: 'Новая заявка',
        deliveriesCount: 'Поставок',
        totalDelivered: 'Всего поставлено',
        totalPaid: 'Всего оплачено',
        latestDeliveries: 'Последние поставки',
        all: 'Все',
        noDeliveries: 'Поставок пока нет',
        delivery: 'Поставка #{id}',
        orders: 'Заявки',
        noOrders: 'Заявок пока нет',
        order: 'Заявка #{id}',
        loadError: 'Кабинет клиента недоступен'
      },
      history: {
        title: 'История поставок',
        noDeliveries: 'Поставок пока нет',
        delivery: 'Поставка #{id}',
        payments: 'Оплаты'
      },
      orders: {
        title: 'Новая заявка',
        subtitle: 'Выберите продукцию и желаемую дату доставки',
        repeatLast: 'Повторить прошлую',
        deliveryDate: 'Дата доставки',
        comment: 'Комментарий',
        commentPlaceholder: 'Например: доставить до 10:00',
        total: 'Итого: {amount} ₸',
        submit: 'Отправить заявку',
        submitting: 'Отправка...',
        myOrders: 'Мои заявки',
        noOrders: 'Заявок пока нет',
        order: 'Заявка #{id}',
        loadError: 'Ошибка загрузки заявок',
        submitError: 'Ошибка отправки заявки',
        repeatError: 'Не удалось повторить прошлую заявку',
        status: {
          pending: 'Ожидает',
          approved: 'Одобрена',
          fulfilled: 'Выполнена',
          rejected: 'Отклонена',
          cancelled: 'Отменена'
        }
      },
      payments: {
        currentDebt: 'Текущий долг',
        availableLimit: 'Доступный лимит',
        totalPaid: 'Всего оплачено',
        title: 'История оплат',
        noPayments: 'Оплат пока нет',
        delivery: 'Поставка #{id}'
      },
      profile: {
        title: 'Профиль клиента',
        name: 'Название',
        type: 'Тип',
        phone: 'Телефон',
        contactPerson: 'Контактное лицо',
        address: 'Адрес',
        driver: 'Водитель',
        noDriver: 'Не назначен',
        debtLimit: 'Лимит долга',
        notSpecified: '—'
      }
    },
    driver: {
      route: {
        title: 'Путевой лист водителя',
        subtitle: 'Просмотр маршрута, остатков в машине и закрытие смены',
        date: 'Дата:',
        status: {
          active: 'Активен',
          closed: 'Закрыт',
          notStarted: 'Не начат',
          routeId: 'Маршрут ID: #{id}',
          noRoute: 'Нет открытого маршрута на эту дату',
          title: 'Маршрут на {date}'
        },
        actions: {
          start: 'Начать маршрут',
          close: 'Закрыть маршрут'
        },
        stats: {
          deliveries: 'Доставок',
          amount: 'Сумма',
          returns: 'Возвраты',
          pieces: 'шт'
        },
        clients: {
          title: 'Список точек доставки',
          subtitle: 'Порядок следования',
          empty: 'Нет закрепленных клиентов на сегодня',
          client: 'Клиент',
          noAddress: 'Адрес не указан',
          status: {
            delivered: 'Доставлено',
            waiting: 'Ожидает'
          },
          amount: 'Сумма: {amount} ₸',
          debt: 'Долг: {amount} ₸',
          orderBadge: 'Заявка #{id}: {amount} ₸',
          moreOrders: 'Еще {count}',
          createDelivery: 'Создать доставку',
          createDeliveryFromOrder: 'Доставка по заявке',
          completed: 'Завершено'
        },
        inventory: {
          title: 'Товар в машине',
          empty: 'Машина пуста. Запросите загрузку со склада.',
          product: 'Товар',
          sku: 'Артикул: #{id}',
          pieces: 'шт',
          restock: 'Запросить пополнение'
        },
        restockModal: {
          title: 'Запрос пополнения',
          description: 'Отправьте запрос пекарю на загрузку дополнительного товара в вашу машину.',
          commentLabel: 'Комментарий к запросу',
          commentPlaceholder: 'Например: Хлеб обычный - 20 шт, Батон - 10 шт',
          cancel: 'Отмена',
          submit: 'Отправить запрос',
          noCommentAlert: 'Пожалуйста, введите текст запроса.',
          successAlert: 'Запрос на пополнение отправлен.'
        },
        alerts: {
          adminCannotStart: 'Администратор должен открыть маршрут для конкретного водителя из управления доставками.',
          cannotStart: 'Не удалось начать маршрут. Возможно, он уже открыт.',
          closeConfirm: 'Вы уверены, что хотите закрыть маршрут и смену? Все доставки за этот день будут заблокированы.',
          closeError: 'Ошибка при закрытии маршрута.',
          restockError: 'Не удалось отправить запрос на пополнение.'
        }
      },
      delivery: {
        title: 'Создание доставки',
        back: 'Вернуться',
        clientInfo: {
          title: 'Информация о клиенте',
          name: 'Название',
          debt: 'Долг'
        },
        order: {
          title: 'Заявка клиента #{id}',
          description: 'Товары из заявки уже подставлены в доставку. При необходимости можно изменить фактическое количество.',
          estimatedTotal: 'Сумма заявки',
          itemsCount: 'Позиций'
        },
        products: {
          title: 'Товары для доставки',
          empty: 'В машине нет товаров для доставки',
          product: 'Товар',
          selectProduct: 'Выберите товар',
          inStock: 'В машине: {quantity}',
          quantity: 'Кол-во',
          price: 'Цена',
          returnQty: 'Возврат',
          returnReason: 'Причина возврата',
          returnReasons: {
            stale: 'Черствый',
            damaged: 'Поврежден',
            other: 'Другое'
          },
          add: 'Добавить товар'
        },
        payment: {
          title: 'Оплата',
          total: 'Итого к оплате:',
          method: 'Способ оплаты',
          methods: {
            cash: 'Наличные',
            kaspi: 'Kaspi',
            debt: 'В долг',
            mixed: 'Смешанно'
          },
          paidAmount: 'Оплаченная сумма',
          cash: 'Наличные',
          kaspi: 'Kaspi'
        },
        submit: 'Подтвердить доставку',
        submitting: 'Отправка...',
        alerts: {
          noClient: 'Клиент не указан',
          orderClientMismatch: 'Заявка не принадлежит выбранному клиенту.',
          adminNoRoute: 'Нет активного маршрута для водителя этого клиента на выбранную дату.',
          driverNoRoute: 'Нет активного маршрута на выбранную дату. Пожалуйста, начните маршрут.',
          loadError: 'Ошибка загрузки данных. Попробуйте еще раз.',
          submitError: 'Ошибка при сохранении доставки'
        }
      },
      returns: {
        title: 'Возвраты по маршруту',
        subtitle: 'Фиксация возвращенного хлеба от клиентов',
        refresh: 'Обновить',
        back: 'Вернуться к маршруту',
        empty: {
          title: 'Нет доставок для возврата',
          subtitle: 'Сначала оформите доставку клиенту в активном маршруте.'
        },
        client: 'Клиент',
        noAddress: 'Адрес не указан',
        delivery: 'Доставка #{id}',
        deliveredItems: 'Доставленные товары',
        product: 'Товар',
        returned: 'Возвращено: {returned} из {total}',
        pieces: 'шт',
        createReturn: 'Оформить возврат',
        selectProduct: 'Выберите товар',
        available: 'доступно {quantity} шт',
        quantity: 'Количество',
        reasons: {
          stale: 'Черствый',
          damaged: 'Поврежден',
          other: 'Другое'
        },
        submit: 'Зафиксировать возврат',
        submitting: 'Сохранение...',
        alerts: {
          noRoute: 'Нет активного маршрута на сегодня.',
          loadError: 'Не удалось загрузить доставки для возврата.',
          invalidInput: 'Выберите товар и укажите количество возврата.',
          exceedsLimit: 'Количество возврата превышает доступный остаток по доставке.',
          submitError: 'Не удалось сохранить возврат.'
        }
      }
    },
    adminOrders: {
      title: 'Заказы клиентов',
      subtitle: 'Управление входящими заявками от клиентов',
      date: 'Дата доставки',
      status: 'Статус',
      client: 'Клиент',
      deliveryDate: 'Доставка',
      amount: 'Сумма',
      items: 'Состав заказа',
      comment: 'Комментарий',
      empty: {
        title: 'Нет заказов',
        description: 'По вашему запросу заказы не найдены',
      },
      statuses: {
        pending: 'Новый',
        approved: 'Подтвержден',
        delivered: 'Доставлен',
        cancelled: 'Отменен',
      },
      actions: {
        approve: 'Утвердить',
        reject: 'Отклонить',
      }
    },
    adminVehicles: {
      title: 'Справочник автомобилей',
      subtitle: 'Управление парком машин для учета расходов',
      add: 'Добавить авто',
      edit: 'Редактировать',
      delete: 'Удалить',
      name: 'Название / Марка',
      licensePlate: 'Гос. номер',
      status: 'Статус',
      active: 'Активен',
      inactive: 'Неактивен',
      empty: 'Автомобили не найдены',
      placeholders: {
        name: 'Например: Lada Largus',
        licensePlate: 'Например: 123 ABC 01',
      },
      modals: {
        add: 'Добавление автомобиля',
        edit: 'Редактирование автомобиля',
        save: 'Сохранить',
        cancel: 'Отмена',
      }
    },
  },
  kz: {
    common: {
      appName: 'Daurennan CRM',
      profile: 'Профиль',
      logout: 'Шығу',
      backToMenu: 'Мәзірге қайту',
      mainMenu: 'Басты мәзір',
      loading: 'Жүктелуде...',
      activeSession: 'Сессия белсенді',
      language: 'Тіл',
      all: 'Барлығы',
      refresh: 'Жаңарту',
      cancel: 'Болдырмау',
      save: 'Сақтау',
    },
    roles: {
      admin: 'Әкімші',
      baker: 'Наубайшы',
      seller: 'Сатушы',
      driver: 'Жүргізуші',
      client: 'Клиент',
    },
    auth: {
      title: 'Daurennan CRM жүйесіне кіру',
      subtitle: 'Жүйеге кіру үшін авторизациядан өтіңіз',
      email: 'Email мекенжайы',
      password: 'Құпиясөз',
      submit: 'Кіру',
      google: 'Google арқылы кіру',
      or: 'немесе',
      loading: 'Кіру...',
      tokenError: 'Кіру қатесі: токен алынбады',
      invalidCredentials: 'Email немесе құпиясөз қате',
      connectionError: 'Серверге қосылу қатесі',
      googleCallback: {
        loading: 'Google арқылы кіру',
        loadingText: 'Аккаунтты тексеріп, жүйені ашып жатырмыз.',
        errorTitle: 'Google арқылы кіру мүмкін болмады',
        backToLogin: 'Кіруге қайту',
      },
      googleErrors: {
        google_auth_failed: 'Google кіруді растамады. Қайта көріңіз.',
        google_email_missing: 'Google аккаунт email-ын қайтармады.',
        account_inactive: 'Аккаунт өшірілген. Әкімшіге хабарласыңыз.',
        missing_token: 'Backend авторизация token-ын қайтармады.',
        callback_failed: 'Кіруді аяқтау мүмкін болмады. Қайта көріңіз.',
      },
    },
    applicant: {
      eyebrow: 'Өтініш беруші кабинеті',
      title: 'Сәлеметсіз бе, {name}',
      subtitle: 'Мұнда жеткізуге қосылу мәртебесі көрсетіледі. Әкімші бекіткенге дейін CRM жұмыс бөлімдері қолжетімсіз.',
      user: 'пайдаланушы',
      statusTitle: 'Өтінім мәртебесі',
      requestName: 'Клиент',
      requestPhone: 'Телефон',
      requestAddress: 'Жеткізу мекенжайы',
      createRequest: 'Өтінім қалдыру',
      refresh: 'Мәртебені жаңарту',
      openCabinet: 'Клиент кабинетін ашу',
      nextTitle: 'Келесі қадамдар',
      loadError: 'Өтінім мәртебесін жүктеу мүмкін болмады',
      status: {
        none: {
          title: 'Өтінім әлі жіберілмеді',
          text: 'Сіз Google арқылы кірдіңіз. Жеткізуге қосылу үшін мекенжай, телефон және ыңғайлы жеткізу уақытын көрсетіп өтінім жіберіңіз.',
        },
        pending: {
          title: 'Өтінім тексеруді күтуде',
          text: 'Әкімші мекенжайды, маршрутты және шарттарды тексереді. Бекітілгеннен кейін клиент кабинетіне қолжетімділік ашылады.',
        },
        approved: {
          title: 'Өтінім бекітілді',
          text: 'Қосылу мақұлданды. Қолжетімділікті жаңартып, клиент кабинетіне өтіңіз.',
        },
        rejected: {
          title: 'Өтінім қабылданбады',
          text: 'Әкімші өтінімді қабылдамады. Себебін нақтылау немесе жаңа өтінім жіберу үшін наубайханаға хабарласыңыз.',
        },
      },
      steps: {
        request: {
          title: 'Өтінім',
          text: 'Байланыс деректері мен жеткізу мекенжайын жібересіз.',
        },
        review: {
          title: 'Тексеру',
          text: 'Әкімші маршрут пен шарттарды тексереді.',
        },
        access: {
          title: 'Қолжетімділік',
          text: 'Бекітілгеннен кейін клиент кабинеті ашылады.',
        },
      },
    },
    publicHome: {
      brandCaption: 'жеткізілетін жаңа піскен нан',
      login: 'Жүйеге кіру',
      dashboard: 'Жұмыс мәзірі',
      badge: 'Дүкендер мен ұйымдарға күнделікті жеткізу',
      title: 'Әр таң сайын нүктеңізге жаңа піскен нан',
      subtitle: 'Нан мен тоқашты тұрақты жеткізуге қосылыңыз. Біз дүкендерден, кафелерден, ұйымдардан және тұрақты клиенттерден өтінім қабылдаймыз, содан кейін әкімші шарттарды растап, сізді маршрутқа қосады.',
      formEyebrow: 'Жеткізуге қосылу',
      formTitle: 'Өтінім қалдырыңыз',
      formText: 'Жібергеннен кейін өтінім әкімшіге түседі. Біз мекенжайды, маршрутты тексеріп, қосылу үшін сізбен байланысамыз.',
      submitting: 'Жіберілуде...',
      submit: 'Өтінім жіберу',
      submitError: 'Өтінімді жіберу мүмкін болмады. Өрістерді тексеріп, қайта көріңіз.',
      fields: {
        name: 'Клиент атауы',
        type: 'Клиент түрі',
        phone: 'Телефон',
        contact: 'Байланыс адамы',
        email: 'Email',
        address: 'Жеткізу мекенжайы',
        time: 'Ыңғайлы уақыт',
        comment: 'Пікір',
      },
      placeholders: {
        name: 'Орталық дүкен',
        contact: 'Аты-жөні',
        address: 'Қала, көше, үй',
        time: 'Мысалы: 07:00-09:00',
        comment: 'Ассортимент, көлем, ерекше шарттар',
      },
      clientTypes: {
        store: 'Дүкен',
        organization: 'Ұйым',
        regular: 'Тұрақты клиент',
        retail: 'Бөлшек клиент',
      },
      metrics: {
        assortment: {
          value: '7-8',
          label: 'күнделікті нан түрі',
        },
        delivery: {
          value: 'таңертең',
          label: 'маршрутпен жеткізу',
        },
        payments: {
          value: 'Kaspi/қолма-қол',
          label: 'ыңғайлы төлем',
        },
      },
      nav: {
        benefits: 'Артықшылықтар',
        catalog: 'Каталог',
        request: 'Өтінім'
      },
      catalog: {
        eyebrow: 'Өнім каталогы',
        title: 'Жаңа піскен өнім ассортименті',
        subtitle: 'Каталогтан тауарларды қарап, жеткізуге қосылу өтінімін қалдырыңыз.',
        fallback: {
          classic: {
            name: 'Классикалық нан',
          },
          rye: {
            name: 'Қара нан',
          },
          bun: {
            name: 'Тәтті тоқаш',
          },
          flatbread: {
            name: 'Тандыр нан',
          },
        },
      },
      benefits: {
        delivery: {
          title: 'Маршруттық жеткізу',
          text: 'Клиент жүргізушіге бекітіледі, жеткізу мен қайтарым жүйеде тіркеледі.',
        },
        fresh: {
          title: 'Жаңа өнім',
          text: 'Өнім өндірілген күні бойынша есептеледі, бүгінгі тауар бөлек көрінеді.',
        },
        payment: {
          title: 'Ыңғайлы төлем',
          text: 'Қолма-қол, Kaspi, жартылай төлем және қарыз бақылауы бар.',
        },
        control: {
          title: 'Ашық есеп',
          text: 'Әкімші жеткізулерді, қайтарымды, қарызды және клиент тарихын көреді.',
        },
      },
      steps: {
        request: {
          number: '1-қадам',
          title: 'Өтінім',
          text: 'Байланыс деректерін, мекенжайды және жеткізу уақытын жібересіз.',
        },
        call: {
          number: '2-қадам',
          title: 'Тексеру',
          text: 'Әкімші шарттарды, ассортиментті және маршрут мүмкіндігін нақтылайды.',
        },
        connect: {
          number: '3-қадам',
          title: 'Қосу',
          text: 'Бекітілгеннен кейін сізді клиент ретінде қосып, жеткізу тағайындайды.',
        },
      },
    },
    deliveryRequestSent: {
      eyebrow: 'Өтінім жіберілді',
      title: 'Рақмет, өтініміңіз қабылданды',
      text: 'Кабинетке кіру әзірге ашылмайды. Әкімші өтінімді тексеріп, сізбен байланысады және бекіткеннен кейін жеткізу клиенті ретінде қосады.',
      home: 'Басты бетке',
      login: 'Кіру',
      steps: {
        review: {
          title: 'Өтінімді тексеру',
          text: 'Әкімші оны CRM ішінде көреді.',
        },
        call: {
          title: 'Қоңырау',
          text: 'Мекенжайды, көлемді және төлемді нақтылаймыз.',
        },
        delivery: {
          title: 'Қосу',
          text: 'Бекітілгеннен кейін маршрутқа қосасыз.',
        },
      },
    },
    dashboard: {
      subtitle: 'Жүйе модульдерінің басты мәзірі',
      noModulesTitle: 'Қолжетімді модульдер жоқ',
      noModulesText: 'Бұл пайдаланушыға жүйе бөлімдеріне құқықтар берілмеген.',
      groups: {
        sales: 'Сату және Клиенттер',
        production: 'Қойма және Өндіріс',
        dictionaries: 'Анықтамалықтар',
        management: 'Басқару және Есептер',
      },
      badges: {
        implemented: 'Іске қосылды',
        pwa: 'PWA интерфейс',
        cabinet: 'Кабинет',
      },
      modules: {
        pos: {
          title: 'Касса (POS)',
          description: 'Бөлшек сауда, себет, Kaspi және қолма-қол төлем, қойма қалдығын есептен шығару.',
        },
        products: {
          title: 'Тауарлар',
          description: 'Тауарларды басқару, сурет жүктеу, бағалар және баптаулар.',
        },
        recipes: {
          title: 'Рецепттер',
          description: 'Өнімге арналған шикізат нормалары: ұн, ашытқы, тұз, су және қаптама.',
        },
        production: {
          title: 'Өндіріс',
          description: 'Пісіруді енгізу, рецепт бойынша шикізатты есептен шығару және дайын өнім кірісі.',
        },
        rawMaterials: {
          title: 'Шикізат',
          description: 'Ұн, ашытқы, тұз: негізгі өлшемдер, қаптамалар және қайта есептеу коэффициенттері.',
        },
        categories: {
          title: 'Санаттар',
          description: 'Нан және тоқаш бөлімдерін басқару.',
        },
        users: {
          title: 'Қызметкерлер',
          description: 'Жүйе пайдаланушылары және олардың байланыс деректері.',
        },
        roles: {
          title: 'Рөлдер мен қолжетімділік',
          description: 'Рөлдер конструкторы. Құқықтарды икемді баптау.',
        },
        expenses: {
          title: 'Шығындар',
          description: 'Жалдау, жалақы, жанармай және күнделікті басқа шығындар.',
        },
        purchases: {
          title: 'Шикізат сатып алу',
          description: 'Ұн/ашытқыға өтінімдер және қойманы автоматты толықтыру.',
        },
        reports: {
          title: 'Аналитика және есептер',
          description: 'Күндік жиынтық, шығындар, клиент қарыздары, жүргізушілер есептері.',
        },
        clients: {
          title: 'Клиенттер',
          description: 'Дүкендер, ұйымдар, жүргізушілерге бекіту, ауыстыру тарихы, қарыздар.',
        },
        deliveryRoutes: {
          title: 'Жеткізу маршруттары',
          description: 'Маршрут құру, жүргізушіге тауар беру және жеткізуді бақылау.',
        },
        driver: {
          title: 'Жеткізу (Жүргізуші)',
          description: 'Маршруттар, клиент қарыздары, нан қайтарымдары.',
        },
        clientPortal: {
          title: 'Клиент кабинеті',
          description: 'Жеткізу тарихы, төлемдер, қарыз және қайталама тапсырыс өтінімдері.',
        },
      },
    },
    profile: {
      title: 'Аккаунт профилі',
      subtitle: 'Ағымдағы пайдаланушы деректері және қолжетімділіктер',
      roles: 'Рөлдер',
      noRoles: 'Рөлдер жоқ',
      status: 'Статус',
      active: 'Белсенді',
      inactive: 'Өшірілген',
      quickLinks: 'Жылдам өту',
      adminMenu: 'Әкімші мәзірі',
      pos: 'Касса',
      route: 'Маршрут',
      clientCabinet: 'Клиент кабинеті',
      loadError: 'Профильді жүктеу мүмкін болмады',
    },
    production: {
      breadcrumb: 'Өндіріс',
      title: 'Пісірілді',
      recipes: 'Рецепттер',
      reports: 'Есептер',
      date: 'Күні',
      status: 'Статус',
      total: 'Барлығы',
      product: 'Тауар',
      plan: 'Жоспар',
      baked: 'Пісірілді',
      chooseProduct: 'Тауарды таңдаңыз',
      addRow: 'Жол қосу',
      saveDraft: 'Черновикті сақтау',
      saveProduction: 'Қоймаға өткізу',
      finalizeDraft: 'Черновикті қоймаға өткізу',
      saving: 'Сақталуда...',
      draftSaved: 'Өндіріс черновигі сақталды',
      draftUpdated: 'Өндіріс черновигі жаңартылды',
      draftLoaded: 'Черновик формаға жүктелді',
      draftFinalized: 'Черновик қоймаға өткізілді: {quantity} дана',
      productionSaved: 'Шығарылым қоймаға өткізілді: {quantity} дана',
      loadError: 'Өндірісті жүктеу мүмкін болмады',
      saveError: 'Шығарылымды сақтау мүмкін болмады',
      editingDraft: 'Черновикті өңдеу #{id}',
      editingDraftHint: 'Нақты шығарылым тексерілгеннен кейін оны қоймаға өткізіңіз.',
      cancelEdit: 'Болдырмау',
      editDraft: 'Черновикті ашу',
      latestBatches: 'Соңғы партиялар',
      records: '{count} жазба',
      refresh: 'Жаңарту',
      noBatches: 'Партиялар әлі жоқ',
      batch: 'Партия #{id}',
      baker: 'Наубайшы',
      ingredients: 'Шикізат',
      pieces: 'дана',
      deleteRow: 'Жолды өшіру',
      mainMenu: 'Басты мәзірге',
      menu: 'Мәзірге',
      cancelBatch: 'Партияны болдырмау',
      deleteBatch: 'Партияны жою',
      confirmCancel: 'Осы партияны болдырмауға сенімдісіз бе? Дайын өнім есептен шығарылып, шикізат қоймаға қайтарылады.',
      confirmDelete: 'Осы партияны біржола жоюға сенімдісіз бе?',
      cancelledSuccess: 'Партия сәтті болдырмалынды',
      deletedSuccess: 'Партия жойылды',
      cancelError: 'Партияны болдырмау мүмкін болмады',
      deleteError: 'Партияны жою мүмкін болмады',
      copyPrevious: 'Кешегі бойынша толтыру',
      templateLoaded: 'Ассортимент сәтті көшірілді',
      noTemplateFound: 'Алдыңғы партиялар табылмады',
      cancelModal: {
        eyebrow: 'Қойма бақылауы',
        title: 'Партияны болдырмау #{id}',
        text: 'Жүйе өткізілген өндірісті кері қайтарады: шикізатты қоймаға қосып, осы күннің дайын өнімін есептен шығарады.',
        date: 'Партия күні',
        status: 'Қазіргі статус',
        quantity: 'Саны',
        products: 'Партиядағы өнімдер',
        warning: 'Болдырмау тек дайын өнім қоймада жеткілікті болса орындалады. Тауар сатылып қойған немесе жүргізушіге берілген болса, backend операцияны тоқтатады.',
        keep: 'Партияны қалдыру',
        confirm: 'Иә, болдырмау',
        processing: 'Орындалуда...',
      },
      deleteModal: {
        eyebrow: 'Жазбаны жою',
        title: 'Партияны жою #{id}',
        text: 'Партия жазбасы, тауарлары және шикізат есебі жойылады. Бұл әрекет тек черновиктерге және болдырылмаған партияларға қолжетімді.',
        warning: 'Жою қайтарылмайды. Қоймаға өткізілген партияны кері қайтару керек болса, алдымен партияны болдырмауды қолданыңыз.',
        confirm: 'Иә, жою',
      },
      statuses: {
        draft: 'Черновик',
        confirmed: 'Расталды',
        closed: 'Өткізілді',
        cancelled: 'Болдырылмады',
      },
    },
    pos: {
      backTitle: 'Басты мәзірге',
      backShort: 'Мәзірге',
      receipt: 'Чек',
      history: 'Тарих',
      closeShift: 'Сменаны жабу',
      shiftShort: 'Смена',
      cashier: 'Касса',
      owner: 'Иесі',
      cashierEmployee: 'Касса қызметкері',
      shiftChecking: 'Смена тексерілуде',
      shiftOpenCaption: 'Смена ашық · басында {amount} ₸',
      shiftNeedsCloseCaption: '{date} сменасы жабылмаған',
      shiftClosed: 'Смена жабық',
      shiftNotOpen: 'Смена ашылмаған',
      openShiftTitle: 'Сменаны ашыңыз',
      previousShiftClosed: 'Алдыңғы смена жабылған. Қазір кассада жатқан қолма-қол ақшаны енгізіңіз.',
      previousShiftOpenTitle: 'Алдыңғы сменаны жабыңыз',
      previousShiftOpenHint: '{date} күнгі ашық смена жаңа сменаны ашуға кедергі жасайды. Алдымен оны жабыңыз, содан кейін бүгінгі сменаны ашыңыз.',
      previousShiftOpeningCash: 'Смена басында',
      openShiftHint: 'Сатуды бастамас бұрын кассадағы бастапқы қолма-қол ақшаны бекіту керек.',
      openingCash: 'Смена басындағы кассадағы қолма-қол ақша',
      opening: 'Ашылуда...',
      openShift: 'Сменаны ашу',
      allProducts: 'Барлық тауарлар',
      saleSuccessTitle: 'Чек сәтті өткізілді',
      saleSaved: 'Сату сақталды',
      receiptNumber: 'Чек #{id}',
      amount: 'Сома',
      payment: 'Төлем',
      closeNotification: 'Хабарламаны жабу',
      shortage: 'Жетіспеушілік: {amount} ₸',
      noShortage: 'Жетіспеушілік жоқ',
      checkShiftError: 'Сменаны тексеру мүмкін болмады',
      openShiftError: 'Сменаны ашу мүмкін болмады',
      payments: {
        cash: 'Қолма-қол',
        kaspi: 'Kaspi',
        mixed: 'Аралас',
        debt: 'Қарызға',
      },
      cart: {
        title: 'Ағымдағы чек',
        clear: 'Тазарту',
        empty: 'Себет бос',
        perPiece: '₸ / дана',
        totalDue: 'Төлеуге:',
        pay: 'Төлеу',
      },
      product: {
        unavailable: 'Қоймада жоқ',
        pcs: 'дана',
      },
      paymentModal: {
        title: 'Чекті төлеу',
        totalDue: 'Төлеуге барлығы',
        chooseMethod: 'Төлем әдісін таңдаңыз',
        mixed: 'Аралас төлем (Қолма-қол + Kaspi)',
        cash: 'Қолма-қол:',
        remaining: 'Бөлінбей қалған сома:',
        erase: 'Өшіру',
        clear: 'Тазарту',
        submit: 'Чекті өткізу',
        submitting: 'Өткізілуде...',
        allCashPreset: 'Қолм.',
        invalidSplit: 'Сома дұрыс бөлінбеген.',
        submitError: 'Төлемді өткізу қатесі. Қойма қалдығын тексеріңіз.',
      },
      historyPanel: {
        title: 'Чектер тарихы',
        count: '{count} чек',
        refresh: 'Жаңарту',
        total: 'Сома',
        empty: 'Чектер жоқ',
        product: 'Тауар',
      },
      closeModal: {
        titleSmall: 'Кассалық смена',
        title: 'Сменаны жабу',
        shiftDate: 'Смена күні: {date}',
        closeWindow: 'Терезені жабу',
        shiftStart: 'Смена басы',
        sales: 'Сатылымдар',
        expectedCash: 'Күтілетін қолма-қол',
        expectedKaspi: 'Күтілетін Kaspi',
        actualAmounts: 'Нақты сомалар',
        actualHint: 'Жабу кезінде нақты бар ақшаны енгізіңіз.',
        fillExpected: 'Күтілгенмен толтыру',
        expected: 'Күтілетін',
        input: 'Енгізу: {field}',
        closing: 'Жабылуда...',
        summary: 'Смена бойынша тарату',
        receiptCount: 'Чектер',
        cashSales: 'Қолма-қол сатылым',
        kaspiSales: 'Kaspi сатылым',
        cashDrawer: 'Тапсыратын касса',
        explanation: 'Қолма-қол ақша смена басындағы ақшамен бірге саналады. Kaspi аударымдар бойынша бөлек салыстырылады.',
        productCheck: 'Тауарлар бойынша сатылым',
        noProductsIssued: 'Тауарлар бойынша сатылым жоқ',
        sold: 'Сатылды',
        product: 'Тауар',
        loadError: 'Смена сатылымдарын жүктеу мүмкін болмады',
        closeError: 'Сменаны жабу мүмкін болмады',
      },
      keypad: {
        erase: 'Өшіру',
        clear: 'Тазарту',
      },
    },
    layout: {
      route: 'Маршрут',
      driver: 'Жүргізуші',
      exit: 'Шығу',
      deliveries: 'Жеткізулер',
      returns: 'Қайтарымдар',
      cabinet: 'Кабинет',
      client: 'Клиент',
      overview: 'Шолу',
      orders: 'Өтінімдер',
      history: 'Тарих',
      payments: 'Төлемдер',
      profile: 'Профиль',
    },
    routerTitles: {
      driverRoute: 'Менің маршрутым',
      driverDeliveryCreate: 'Жеткізу жасау',
      driverReturns: 'Қайтарымдар',
      clientDashboard: 'Клиент кабинеті',
      clientOrders: 'Өтінімдер',
      clientHistory: 'Жеткізу тарихы',
      clientPayments: 'Төлемдер және қарыз',
      clientProfile: 'Профиль',
    },
    adminRoles: {
      breadcrumb: 'Рөлдер мен Қолжетімділік',
      title: 'Қолжетімділікті Басқару',
      createRole: 'Рөл жасау',
      system: 'System',
      assignedPermissions: 'Тағайындалған құқықтар',
      noPermissions: 'Құқықтар жоқ',
      configureAccess: 'Құқықтарды баптау',
      fullAccess: 'Толық қолжетімділік',
      delete: 'Жою',
      confirmDelete: '"{name}" рөлін жою керек пе?',
      loadError: 'Деректерді жүктеу қатесі',
      saveError: 'Рөлді сақтау қатесі',
      deleteError: 'Жою қатесі',
    },
    updater: {
      updateAvailable: 'Жаңарту қолжетімді',
      updateAvailableDesc: 'Жаңа {version} нұсқасы жүктеуге дайын. Қазір жаңарту керек пе?',
      downloading: 'Жаңарту жүктелуде...',
      downloadingDesc: 'Файл жүктелгенше күте тұрыңыз.',
      downloaded: 'Жаңарту дайын',
      downloadedDesc: 'Жаңа нұсқа жүктелді және орнатуға дайын. Қосымша қайта іске қосылады.',
      error: 'Жаңарту қатесі',
      downloadBtn: 'Жүктеу',
      installBtn: 'Қайта іске қосу және жаңарту',
      cancelBtn: 'Кейін',
    },
    adminUsers: {
      breadcrumb: 'Қызметкерлер',
      title: 'Қызметкерлер және Құқықтар',
      createUser: 'Қызметкер қосу',
      searchPlaceholder: 'Аты-жөні немесе email бойынша іздеу...',
      allRoles: 'Барлық рөлдер',
      emptyState: 'Қызметкерлер табылмады',
      columns: {
        nameAndContacts: 'Аты-жөні және Байланыс',
        roleAndAccess: 'Рөл (Құқық)',
        actions: 'Әрекеттер',
      },
      noRole: 'Рөлсіз',
      edit: 'Өңдеу',
      delete: 'Жою',
      confirmDelete: '"{name}" қызметкерін шынымен жойғыңыз келе ме?',
      loadError: 'Деректерді жүктеу қатесі',
      saveError: 'Қызметкерді сақтау қатесі',
      deleteError: 'Жою қатесі',
      bakerProducts: {
        title: 'Наубайшы тауарлары',
        hint: 'Наубайшы өндіріс бетінде тек таңдалған тауарларды қоса алады.',
        empty: 'Белсенді тауарлар әлі жоқ',
        required: 'Наубайшы үшін кемінде бір тауар таңдаңыз',
        none: 'Тауарлар бекітілмеген',
        assigned: 'Бекітілген: {count}. {products}',
      },
      deliveryStockMode: {
        title: 'Жеткізу тауарының есептен шығарылуы',
        hint: 'Бұл баптау тек жүргізушілерге қолданылады.',
        warehouse: {
          title: 'Тікелей қоймадан',
          text: 'Жүргізуші тауарды алдын ала алмай-ақ жеткізуді рәсімдейді. Тауар жеткізу сақталған кезде қоймадан есептен шығарылады.',
        },
        driverTransfer: {
          title: 'Жүргізушіге берілген бойынша',
          text: 'Алдымен әкімші тауарды жүргізушіге береді, содан кейін жеткізу көліктегі қалдықтан есептен шығарылады.',
        },
      },
    },
    adminCategories: {
      breadcrumb: 'Санаттар',
      title: 'Санаттар Анықтамалығы',
      addCategory: 'Санат қосу',
      noDescription: 'Сипаттамасыз',
      edit: 'Өңдеу',
      delete: 'Жою',
      confirmDelete: '"{name}" санатын жою керек пе? Ішінде тауарлар жоқ екеніне көз жеткізіңіз.',
      loadError: 'Деректерді жүктеу қатесі',
      saveError: 'Санатты сақтау қатесі',
      deleteError: 'Жою қатесі. Санат бос болмауы мүмкін.',
    },
    adminProducts: {
      breadcrumb: 'Тауарлар',
      title: 'Өнімдер каталогі',
      recipesBtn: 'Шикізат рецепттері',
      addProduct: 'Тауар қосу',
      emptyTitle: 'Тауарлар жоқ',
      emptyText: 'Каталог бос. Алғашқы нан немесе пісірілген өнімді қосыңыз.',
      startAdding: 'Қосуды бастау →',
      inactive: 'Белсенді емес',
      edit: '✏️ Өңдеу',
      recipe: '📋 Рецепт',
      noCategory: 'Санатсыз',
      retail: 'Бөлшек',
      wholesale: 'Көтерме (Жеткізу)',
      loadError: 'Деректерді жүктеу қатесі',
      saveError: 'Тауарды сақтау қатесі',
    },
    adminRecipes: {
      breadcrumb: 'Рецепттер',
      title: 'Өнім рецепттері',
      rawMaterialsBtn: 'Шикізат',
      productsBtn: 'Тауарлар',
      newRecipe: 'Жаңа рецепт',
      withoutRecipe: 'Рецептсіз: {products}. Бұл тауарлар үшін өндіріс шикізат шығынын есептей алмайды.',
      emptyTitle: 'Рецепттер жоқ',
      emptyText: 'Өндіріс қойманы автоматты түрде есептен шығаруы үшін тауарларға шикізат нормаларын қосыңыз.',
      createFirstRecipe: 'Алғашқы рецептті жасау',
      deletedProduct: 'Жойылған тауар',
      active: 'Белсенді',
      inactive: 'Өшірілген',
      normFor: '{quantity} {unit} нормасы',
      edit: 'Өңдеу',
      delete: 'Жою',
      deletedRawMaterial: 'Жойылған шикізат',
      writeOffInfo: 'Өндірісті растаған кезде есептен шығарылады',
      loadError: 'Рецепттерді жүктеу қатесі',
      saveError: 'Рецептті сақтау қатесі',
      confirmDelete: '"{name}" үшін рецептті жою керек пе? Өндіріс бұл тауар бойынша шикізатты есептен шығаруды тоқтатады.',
      deleteError: 'Рецептті жою қатесі',
    },
    adminRawMaterials: {
      breadcrumb: 'Шикізат',
      title: 'Шикізат анықтамалығы',
      recipesBtn: 'Рецепттер',
      addMaterial: 'Шикізат қосу',
      emptyTitle: 'Шикізат жоқ',
      emptyText: 'Ұн, ашытқы, тұз, су немесе қаптама қосыңыз.',
      createFirstMaterial: 'Алғашқы шикізатты жасау',
      columns: {
        material: 'Шикізат',
        conversion: 'Конвертация',
        stock: 'Қалдықтар',
        supplier: 'Жеткізуші',
        actions: 'Әрекеттер',
      },
      active: 'Белсенді',
      inactive: 'Өшірілген',
      inRecipes: 'Рецепттерде: {unit}',
      conversionRule: '1 {purchaseUnit} = {qty} {unit}',
      purchaseIn: 'Сатып алу: {purchaseUnit}',
      minStock: 'мин. {qty} {unit}',
      recStock: 'ұсын. {qty} {unit}',
      notSpecified: 'Көрсетілмеген',
      edit: 'Өңдеу',
      delete: 'Жою',
      loadError: 'Шикізатты жүктеу қатесі',
      saveError: 'Шикізатты сақтау қатесі',
      confirmDelete: '"{name}" шикізатын жою керек пе? Егер ол рецепттерде немесе қойма қозғалыстарында қолданылса, жоюға тыйым салынуы мүмкін.',
      deleteError: 'Шикізатты жою қатесі',
    },
    adminClients: {
      breadcrumb: 'Клиенттер',
      title: 'Клиенттерді басқару',
      addClient: 'Клиент қосу',
      tabs: {
        clients: 'Клиенттер ({count})',
        transfers: '🔄 Қайта тағайындау тарихы ({count})',
        requests: 'Жеткізу өтінімдері ({count})',
      },
      columns: {
        client: 'Клиент',
        type: 'Түрі',
        contacts: 'Байланыстар',
        account: 'Аккаунт',
        driver: 'Жүргізуші',
        debtLimit: 'Қарыз / Лимит',
        status: 'Статус',
        actions: 'Әрекеттер',
        oldDriver: 'Ескі жүргізуші',
        newDriver: 'Жаңа жүргізуші',
        period: 'Кезең',
        reason: 'Себеп',
        approver: 'Бекіткен',
      },
      clientTypes: {
        store: 'Дүкен',
        organization: 'Ұйым',
        regular: 'Тұрақты клиент',
        retail: 'Бөлшек клиент',
      },
      notAssigned: 'Байланыстырылмаған',
      noDriver: 'Тағайындалмаған',
      debt: 'Қарыз',
      limit: 'лимит: {amount} ₸',
      active: 'Белсенді',
      inactive: 'Белсенді емес',
      pay: '💰 Төлеу',
      transfer: '🔄 Қайта тағайынд.',
      edit: 'Өңдеу',
      delete: 'Жою',
      emptyClients: 'Әзірге клиенттер жоқ.',
      emptyTransfers: 'Әзірге қайта тағайындаулар болмады.',
      emptyRequests: 'Әзірге қосылуға өтінімдер жоқ.',
      approveAndCreate: 'Бекітіп, клиент жасау',
      reject: 'Қабылдамау',
      clientNumber: 'Клиент #{id}',
      modal: {
        editTitle: 'Клиентті өңдеу',
        newTitle: 'Жаңа клиент',
        name: 'Атауы *',
        type: 'Түрі *',
        account: 'Жеке кабинет аккаунты',
        phone: 'Телефон',
        contactPerson: 'Байланыс тұлғасы',
        address: 'Мекенжай',
        assignDriver: 'Жүргізушіні тағайындау',
        debtLimit: 'Қарыз лимиті (₸)',
        isActive: 'Белсенді',
        cancel: 'Болдырмау',
        save: 'Сақтау',
        create: 'Жасау',
        saving: 'Сақталуда...',
        transferTitle: 'Жүргізушіні қайта тағайындау',
        client: 'Клиент:',
        newDriver: 'Жаңа жүргізуші *',
        selectDriver: '— Жүргізушіні таңдаңыз —',
        dateFrom: 'Басталу күні *',
        dateTo: 'Аяқталу күні',
        reason: 'Себеп',
        reasonPlaceholder: 'Жүргізуші ауырып қалды / көлік жөндеуде...',
        transferBtn: 'Қайта тағайындау',
        paymentTitle: 'Қарызды өтеу',
        amount: 'Төлем сомасы (₸) *',
        currentDebt: 'Ағымдағы қарыз: {amount} ₸',
        paymentMethod: 'Төлем әдісі *',
        cash: 'Қолма-қол ақша',
        kaspi: 'Kaspi Аударым',
        mixed: 'Аралас төлем',
        comment: 'Түсініктеме',
        commentPlaceholder: 'Мысалы: Директордан аударым',
        acceptPayment: 'Төлемді қабылдау',
        waiting: 'Күте тұрыңыз...',
      },
      errors: {
        load: 'Деректерді жүктеу қатесі',
        enterName: 'Клиенттің атауын енгізіңіз',
        save: 'Сақтау қатесі',
        selectNewDriver: 'Жаңа жүргізушіні таңдаңыз',
        enterDateFrom: 'Басталу күнін көрсетіңіз',
        transfer: 'Қайта тағайындау қатесі',
        confirmDelete: '"{name}" клиентін жою керек пе?',
        delete: 'Жою қатесі',
        confirmApprove: '"{name}" өтінімін бекітіп, клиент жасау керек пе?',
        approve: 'Өтінімді бекіту қатесі',
        confirmReject: '"{name}" өтінімін қабылдамау керек пе?',
        reject: 'Өтінімді қабылдамау қатесі',
        enterAmount: 'Дұрыс соманы енгізіңіз',
        amountExceedsDebt: 'Сома ағымдағы қарыздан аспауы керек',
        payment: 'Төлемді өткізу қатесі',
      },
      requests: {
        new: 'Жаңа',
        approved: 'Бекітілді',
        rejected: 'Қабылданбады',
        phone: 'Телефон:',
        email: 'Email:',
        address: 'Мекенжай:',
        contact: 'Байланыс:',
        time: 'Уақыт:',
        date: 'Өтінім күні:',
      }
    },
    adminRoutes: {
      title: 'Жеткізу маршруттары',
      description: 'Маршрут жасау, жүргізушіге тауар беру және жеткізу нүктелерін бақылау',
      date: 'Маршрут күні',
      driver: 'Жүргізуші',
      selectDriver: 'Жүргізушіні таңдаңыз',
      waybill: 'Жол парағы',
      summarySelectDriver: 'Маршрутты жасау немесе көру үшін жүргізушіні таңдаңыз.',
      summaryNotCreated: 'Таңдалған күнге маршрут әлі жасалмаған.',
      summaryCreated: '{date} күнгі #{id} маршрут',
      createRoute: 'Маршрут жасау',
      closeRoute: 'Маршрутты жабу',
      active: 'Белсенді',
      closed: 'Жабық',
      deliveryPoints: 'Жеткізу нүктелері',
      pointsDescription: 'Таңдалған жүргізушіге бекітілген клиенттер',
      noDriverSelected: 'Жүргізушіні таңдаңыз.',
      noClients: 'Жүргізушіде бекітілген клиенттер жоқ. «Клиенттер» бөлімінде клиенттерді тағайындаңыз.',
      noAddress: 'Мекенжай көрсетілмеген',
      delivered: 'Жеткізілді',
      pending: 'Күтілуде',
      debt: 'Қарыз: {amount} ₸',
      orderBadge: 'Өтінім #{id}: {amount} ₸',
      createDelivery: 'Жеткізуді жасау',
      createDeliveryFromOrder: 'Өтінім бойынша жеткізу',
      stockInCar: 'Көліктегі тауар',
      carEmpty: 'Көлік бос.',
      product: 'Тауар',
      pieces: '{amount} дана',
      giveProduct: 'Тауар беру',
      selectProduct: 'Қоймадан тауар таңдаңыз',
      productAvailable: '{name} — қолжетімді {amount} дана',
      quantity: 'Саны',
      giveToDriver: 'Жүргізушіге беру',
      copyYesterday: 'Кешегі берілгендер бойынша толтыру',
      confirmTemplate: 'Жүргізушіге алдыңғы жолғыдай тауарлар жиынтығын беру керек пе?',
      stockModeWarehouseTitle: 'Есептен шығару қоймадан жүреді',
      stockModeWarehouseText: 'Бұл жүргізуші үшін көлікке тауар беру өшірілген. Жеткізу рәсімделген кезде тауар тікелей қойма қалдығынан есептен шығарылады.',
      errors: {
        create: 'Маршрутты жасау мүмкін болмады.',
        confirmClose: 'Маршрутты жабу керек пе? Жабылғаннан кейін жүргізуші бұл маршрут бойынша жеткізу мен қайтаруларды рәсімдей алмайды.',
        close: 'Маршрутты жабу мүмкін болмады.',
        transfer: 'Жүргізушіге тауар беру мүмкін болмады.'
      }
    },
    adminExpenses: {
      breadcrumb: 'Шығыстар',
      title: 'Шығыстарды есепке алу',
      typeDirectory: 'Түрлер анықтамалығы',
      addExpense: 'Шығыс қосу',
      columns: {
        date: 'Күні',
        type: 'Шығыс түрі',
        employeeVehicle: 'Қызметкер / Көлік',
        comment: 'Түсініктеме',
        receipt: 'Түбіртек (чек)',
        author: 'Авторы',
        amount: 'Сомасы',
        actions: 'Әрекеттер',
      },
      receiptBtn: '📄 Түбіртек',
      delete: 'Жою',
      empty: 'Әзірге шығыстар жоқ.',
      errors: {
        load: 'Деректерді жүктеу қатесі',
        save: 'Сақтау қатесі',
        confirmDelete: '{amount} сомасына шығысты жойғыңыз келетініне сенімдісіз бе?',
        delete: 'Жою қатесі'
      },
      modals: {
        newExpense: 'Жаңа шығыс',
        date: 'Күні',
        type: 'Шығыс түрі',
        selectCategory: 'Санатты таңдаңыз',
        employee: 'Қызметкер (міндетті емес)',
        noEmployee: 'Қызметкерсіз',
        vehicle: 'Көлік (міндетті емес)',
        noVehicle: 'Көліксіз',
        noLicensePlate: 'Нөмірсіз',
        amount: 'Сомасы (тг)',
        receipt: 'Түбіртек фотосы / Тіркеме',
        comment: 'Түсініктеме',
        commentPlaceholder: 'Тазалағыш заттарды сатып алу...',
        errors: {
          fillRequired: 'Міндетті өрістерді толтырыңыз'
        }
      }
    },
    adminExpenseTypes: {
      breadcrumb: 'Шығыс түрлері',
      title: 'Шығыс түрлерінің анықтамалығы',
      addType: 'Түр қосу',
      errors: {
        save: 'Сақтау қатесі',
        confirmDelete: '"{name}" түрін жою керек пе? Егер оған шығыстар байланған болса, бұл мүмкін емес.',
        delete: 'Жою қатесі. Бәлкім, бұл түр шығыстарда қолданылып жатыр.'
      },
      modals: {
        editType: 'Түрді өңдеу',
        newType: 'Жаңа шығыс түрі',
        name: 'Атауы (мысалы: Жалға алу)',
        errors: {
          fillName: 'Атауын толтырыңыз'
        }
      }
    },
    adminPurchases: {
      breadcrumb: 'Сатып алу',
      title: 'Шикізат өтінімдері',
      newRequest: 'Жаңа өтінім',
      columns: {
        idDate: 'ID / Күні',
        rawMaterial: 'Шикізат',
        purchaseStock: 'Сатып алу / қойма',
        status: 'Мәртебесі',
        actions: 'Әрекеттер',
      },
      units: {
        pack: 'қап.',
        unit: 'б.',
      },
      approve: 'Мақұлдау',
      reject: 'Қабылдамау',
      receive: 'Қоймаға алу',
      empty: 'Әзірге өтінімдер жоқ.',
      statuses: {
        draft: 'Жоба',
        pending_approval: 'Бекітуде',
        approved: 'Мақұлданды',
        rejected: 'Қабылданбады',
        received: 'Алынды',
      },
      errors: {
        load: 'Деректерді жүктеу қатесі',
        save: 'Өтінімді жасау қатесі',
        confirmDelete: '#{id} өтінімді жою керек пе?',
        delete: 'Жою қатесі',
        confirmReceive: 'Шикізат қаптамалардан базалық өлшем бірліктеріне қайта есептеліп, қоймаға қосылады. Жалғастырамыз ба?',
        actionError: '{action} әрекетін орындау қатесі'
      },
      modals: {
        newRequest: 'Сатып алуға жаңа өтінім',
        expectedDate: 'Күтілетін күн',
        rawMaterial: 'Шикізат',
        selectRawMaterial: 'Шикізатты таңдаңыз...',
        quantity: 'Сатып алу бірліктерінің саны',
        estimatedPrice: 'Сатып алу бірлігінің бағасы (міндетті емес, тг)',
        stockReceivePreview: 'Қоймаға түседі',
        previewHelper: 'Қайта есептеуді көру үшін шикізат пен санды таңдаңыз.',
        pack: 'қап.',
        unit: 'б.',
        errors: {
          fillRequired: 'Шикізат пен санды толтырыңыз'
        }
      }
    },
    adminReports: {
      breadcrumb: 'Аналитика',
      title: 'Бірыңғай есептер орталығы',
      tabs: {
        daily: 'Күндік жиынтық',
        production: 'Өндіріс',
        inventory: 'Қойма',
        expenses: 'Шығыстар',
        clients: 'Клиенттер',
        drivers: 'Жүргізушілер',
        employees: 'Қызметкерлер'
      },
      expense: {
        title: 'Шығыстар есебі',
        from: 'Бастап:',
        to: 'Дейін:',
        total: 'Барлығы: {amount} ₸',
        byCategory: 'Санаттар бойынша шығыстар',
        columns: {
          date: 'Күні',
          category: 'Санат',
          comment: 'Пікір',
          employee: 'Қызметкер',
          amount: 'Сомасы (₸)'
        },
        filters: {
          search: 'Іздеу (қызметкер, пікір)',
          allCategories: 'Барлық санаттар',
          allEmployees: 'Барлық қызметкерлер',
          allVehicles: 'Барлық автомобильдер',
          sortBy: 'Сұрыптау',
          sortByDate: 'Күні бойынша',
          sortByAmount: 'Сома бойынша',
          sortAsc: '↑ Өсу бойынша',
          sortDesc: '↓ Кему бойынша',
          found: 'Табылды: {count} шығ.',
          activeFilters: '{count} сүзгі',
          apply: 'Іздеу',
          reset: 'Тазарту'
        },
        other: 'Басқа',
        empty: 'Таңдалған кезеңде шығыстар болған жоқ.'
      },
      intervals: {
        day: 'Күн',
        week: 'Апта',
        month: 'Ай',
        year: 'Жыл',
        custom: 'Кез келген'
      },
      daily: {
        title: 'Жиынтықтар',
        date: 'Күні',
        metrics: {
          baked: 'Пісірілді (дана)',
          retail: 'Бөлшек сауда (₸)',
          deliveries: 'Жеткізу (₸)',
          expenses: 'Шығыстар (₸)'
        },
        productControl: {
          title: 'Тауарды бақылау',
          baked: 'Пісірілді:',
          retailSold: 'Бөлшек сатылды:',
          delivered: 'Клиенттерге жеткізілді:',
          returned: 'Қайтару:',
          stock: 'Қалдық:',
          writeOff: 'Есептен шығару:',
          shortage: 'Тауар жетіспеушілігі:'
        },
        moneyControl: {
          title: 'Ақшаны бақылау',
          cash: 'Қолма-қол ақша:',
          kaspi: 'Kaspi аударым:',
          debt: 'Клиенттердің қарыздары:',
          shortage: 'Ақша жетіспеушілігі:',
          total: 'Барлығы кіріс:'
        }
      },
      clients: {
        title: 'Клиенттер бойынша толық есеп',
        period: 'Кезең: {from} - {to}',
        columns: {
          client: 'Клиент',
          phone: 'Телефон',
          accepted: 'Қабылдады',
          paid: 'Төледі',
          debt: 'Қарыз',
          returns: 'Қайтарымдар',
          bonuses: 'Бонустар',
          details: 'Толығырақ',
          amount: 'Сома',
          returnAmount: 'Қайтарым сомасы',
        },
        metrics: {
          accepted: 'Қабылданған тауар',
          paid: 'Төленді',
          currentDebt: 'Ағымдағы қарыз',
          newDebt: 'Жаңа қарыз',
          returns: 'Қайтарымдар'
        },
        filters: {
          name: 'Аты бойынша іздеу',
          phone: 'Телефон бойынша іздеу',
          allDebt: 'Барлық клиенттер',
          withDebt: 'Қарызы бар',
          withoutDebt: 'Қарызсыз',
          allTypes: 'Барлық түрлер',
          typeStore: 'Дүкен',
          typeOrganization: 'Ұйым',
          typeRetail: 'Бөлшек',
          typeRegular: 'Тұрақты',
          allDrivers: 'Барлық жүргізушілер',
          sortBy: 'Сұрыптау',
          sortByName: 'Аты бойынша',
          sortByDebt: 'Қарыз бойынша',
          sortByAmount: 'Сома бойынша',
          sortAsc: '↑ Өсу бойынша',
          sortDesc: '↓ Кему бойынша',
          found: 'Табылды: {count} кл.',
          activeFilters: '{count} сүзгі',
          apply: 'Іздеу',
          reset: 'Тазарту'
        },
        details: {
          open: 'Толығын ашу',
          back: 'Клиенттер есебіне',
          notFound: 'Таңдалған кезең бойынша есепте клиент табылмады.',
          clientInfo: 'Клиент деректері',
          driver: 'Жүргізуші',
          address: 'Мекенжай',
          debtLimit: 'Қарыз лимиті',
          deliveries: 'Жеткізулер',
          debtPayments: 'Қарыз төлемдері',
          product: 'Тауар',
          returnedProduct: 'Қайтарым {product}: {quantity}'
        },
        loyalty: {
          title: 'Лоялдылық',
          balanceTotal: 'Таңдалған клиенттердегі барлық бонус: {amount}',
          enabled: 'Қосулы',
          bonusPercent: '% есептеу',
          redeemRate: 'Бонус бағамы',
          maxPerOrder: 'Тапсырысқа максимум',
          credit: 'Есептеу',
          debit: 'Шегеру',
          adjustment: 'Түзету',
          amount: 'Бонус сомасы',
          comment: 'Пікір',
          submit: 'Бонустарды сақтау',
          history: 'Бонус тарихы',
          error: 'Бонустарды сақтау мүмкін болмады',
          types: {
            manual_credit: 'Қолмен есептеу',
            manual_debit: 'Қолмен шегеру',
            adjustment: 'Түзету',
            earned: 'Автоматты есептелді',
            redeemed: 'Шегерілді'
          }
        },
        status: {
          pending: 'Күтуде',
          delivered: 'Жеткізілді',
          cancelled: 'Болдырылмады'
        },
        paymentMethods: {
          cash: 'Қолма-қол',
          kaspi: 'Kaspi',
          mixed: 'Аралас',
          debt: 'Қарызға'
        },
        empty: 'Таңдалған кезеңде деректер жоқ.'
      },
      drivers: {
        title: 'Жүргізушілер бойынша жиынтық',
        selectDriver: 'Жүргізуші:',
        selectDriverPlaceholder: 'Жүргізушіні таңдаңыз...',
        date: 'Күні:',
        emptyState: 'Оның есебін көру үшін тізімнен жүргізушіні таңдаңыз.',
        metrics: {
          received: 'Алынған нан (дана)',
          delivered: 'Жеткізілді (дана)',
          returned: 'Қайтарылды (дана)'
        },
        money: {
          title: 'Ақша жинау',
          cash: 'Қолма-қол',
          kaspi: 'Kaspi',
          debt: 'Қарызға (клиенттерге)',
          shortage: 'Жүргізушінің жетіспеушілігі'
        },
        shortage: {
          title: 'Тауарлар бойынша жетіспеушілік',
          columns: {
            product: 'Тауар',
            received: 'Алды',
            delivered: 'Жеткізді',
            returned: 'Қайтарды',
            stock: 'Қалдық',
            shortage: 'Жетіспеушілік'
          },
          pieces: 'дана',
          defaultProduct: 'Тауар'
        }
      },
      employees: {
        title: 'Қызметкерлер бойынша толық есеп',
        period: 'Кезең: {from} - {to}',
        backToEmployees: 'Қызметкерлер есебіне',
        notFound: 'Таңдалған кезең бойынша есепте қызметкер табылмады.',
        empty: 'Таңдалған кезеңде деректер жоқ.',
        noProducts: 'Тауарлар жоқ',
        defaultProduct: 'Тауар',
        defaultClient: 'Клиент',
        metrics: {
          produced: 'Наубайшылар өндірді (дана)',
          delivered: 'Жүргізушілер жеткізді (дана)',
          returned: 'Қайтарымдар (дана)',
          shortage: 'Тауар жетіспеушілігі',
          deliveryAmount: 'Жеткізу сомасы',
          cash: 'Қолма-қол қабылданды',
          kaspi: 'Kaspi қабылданды',
          accepted: 'Барлығы қабылданды',
          debt: 'Қарызға қалды'
        },
        bakers: {
          title: 'Наубайшылар',
          count: 'Қызметкерлер: {count}'
        },
        drivers: {
          title: 'Жүргізушілер',
          count: 'Қызметкерлер: {count}'
        },
        filters: {
          allRoles: 'Барлық рөлдер',
          allEmployees: 'Барлық қызметкерлер',
          bakers: 'Наубайшылар',
          drivers: 'Жүргізушілер',
          baker: 'Наубайшы',
          driver: 'Жүргізуші',
          reset: 'Тазарту'
        },
        columns: {
          employee: 'Қызметкер',
          batches: 'Партиялар',
          produced: 'Өндірді',
          products: 'Тауарлар',
          details: 'Толығырақ',
          routes: 'Маршруттар',
          deliveries: 'Жеткізулер',
          received: 'Алды',
          delivered: 'Жеткізді',
          returned: 'Қайтарым',
          remaining: 'Қалдық',
          amount: 'Сома',
          cash: 'Қолма-қол',
          kaspi: 'Kaspi',
          accepted: 'Қабылданды',
          debt: 'Қарыз',
          shortage: 'Жетіспеушілік'
        },
        details: {
          open: 'Толығын ашу',
          planned: 'Жоспар',
          actual: 'Нақты',
          products: 'Тауарларды салыстыру',
          productionBatches: 'Өндіріс партиялары',
          deliveries: 'Жеткізу мәліметтері',
          returnedProduct: 'Қайтарым {product}: {quantity}'
        },
        status: {
          draft: 'Жоба',
          confirmed: 'Расталды',
          closed: 'Жабылды',
          cancelled: 'Болдырылмады',
          pending: 'Күтуде',
          delivered: 'Жеткізілді',
          active: 'Белсенді'
        }
      },
      inventory: {
        title: 'Қоймалардағы қалдықтар',
        writeOff: {
          title: 'Дайын өнімді есептен шығару',
          description: 'Есептен шығару қойма қозғалысы арқылы өтеді және күнделікті тексеруге түседі.',
          button: 'Есептен шығару',
          loading: 'Шығарылуда...',
          product: 'Тауар',
          selectProduct: 'Тауарды таңдаңыз',
          stock: 'қалдық',
          quantity: 'Саны',
          reason: 'Себеп',
          reasons: {
            stale: 'Кешегі тауар',
            damaged: 'Ақау/зақымдану',
            shortage: 'Жетіспеушілік',
            other: 'Басқа'
          },
          date: 'Күні',
          commentPlaceholder: 'Түсініктеме',
          success: 'Есептен шығару сақталды',
          error: 'Есептен шығаруды сақтау мүмкін болмады'
        },
        products: {
          title: '🥖 Дайын өнім',
          columns: {
            product: 'Тауар және жасы',
            stock: 'Қалдық'
          },
          empty: 'Дайын өнім қоймасы бос',
          pieces: 'дана'
        },
        freshness: {
          fresh: 'Жаңа',
          expiringToday: 'Бүгін мерзімі бітеді',
          expired: 'Мерзімі өтті'
        },
        rawMaterials: {
          title: '🌾 Шикізат',
          columns: {
            material: 'Шикізат',
            stock: 'Қалдық'
          },
          empty: 'Шикізат қоймасы бос',
          low: 'Аз'
        }
      },
      production: {
        title: 'Өндіріс есебі',
        from: 'Бастап:',
        to: 'Дейін:',
        produced: {
          title: 'Шығарылған өнім',
          columns: {
            product: 'Тауар',
            quantity: 'Өндірілді (дана)'
          },
          deleted: 'Жойылған тауар',
          empty: 'Осы кезеңдегі өндіріс туралы деректер жоқ',
          pieces: 'дана'
        },
        consumed: {
          title: 'Шикізат шығыны',
          columns: {
            material: 'Шикізат',
            quantity: 'Жұмсалды'
          },
          deleted: 'Жойылған шикізат',
          empty: 'Шикізат шығыны туралы деректер жоқ'
        }
      }
    },
    clientPortal: {
      dashboard: {
        currentDebt: 'Ағымдағы қарыз',
        limit: 'Лимит: {amount} ₸',
        newOrder: 'Жаңа өтінім',
        deliveriesCount: 'Жеткізілімдер',
        totalDelivered: 'Барлығы жеткізілді',
        totalPaid: 'Барлығы төленді',
        latestDeliveries: 'Соңғы жеткізілімдер',
        all: 'Барлығы',
        noDeliveries: 'Әзірге жеткізілімдер жоқ',
        delivery: 'Жеткізілім #{id}',
        orders: 'Өтінімдер',
        noOrders: 'Әзірге өтінімдер жоқ',
        order: 'Өтінім #{id}',
        loadError: 'Клиент кабинеті қолжетімсіз'
      },
      history: {
        title: 'Жеткізілім тарихы',
        noDeliveries: 'Әзірге жеткізілімдер жоқ',
        delivery: 'Жеткізілім #{id}',
        payments: 'Төлемдер'
      },
      orders: {
        title: 'Жаңа өтінім',
        subtitle: 'Өнімді және қалаған жеткізу күнін таңдаңыз',
        repeatLast: 'Алдыңғыны қайталау',
        deliveryDate: 'Жеткізу күні',
        comment: 'Пікір',
        commentPlaceholder: 'Мысалы: сағат 10:00-ге дейін жеткізу',
        total: 'Барлығы: {amount} ₸',
        submit: 'Өтінімді жіберу',
        submitting: 'Жіберілуде...',
        myOrders: 'Менің өтінімдерім',
        noOrders: 'Әзірге өтінімдер жоқ',
        order: 'Өтінім #{id}',
        loadError: 'Өтінімдерді жүктеу қатесі',
        submitError: 'Өтінімді жіберу қатесі',
        repeatError: 'Алдыңғы өтінімді қайталау мүмкін болмады',
        status: {
          pending: 'Күтуде',
          approved: 'Мақұлданды',
          fulfilled: 'Орындалды',
          rejected: 'Қабылданбады',
          cancelled: 'Болдырмалынды'
        }
      },
      payments: {
        currentDebt: 'Ағымдағы қарыз',
        availableLimit: 'Қолжетімді лимит',
        totalPaid: 'Барлығы төленді',
        title: 'Төлем тарихы',
        noPayments: 'Әзірге төлемдер жоқ',
        delivery: 'Жеткізілім #{id}'
      },
      profile: {
        title: 'Клиент профилі',
        name: 'Атауы',
        type: 'Түрі',
        phone: 'Телефон',
        contactPerson: 'Байланыс тұлғасы',
        address: 'Мекенжай',
        driver: 'Жүргізуші',
        noDriver: 'Тағайындалмаған',
        debtLimit: 'Қарыз лимиті',
        notSpecified: '—'
      }
    },
    driver: {
      route: {
        title: 'Жүргізушінің жол парағы',
        subtitle: 'Маршрутты, көліктегі қалдықтарды қарау және ауысымды жабу',
        date: 'Күні:',
        status: {
          active: 'Белсенді',
          closed: 'Жабық',
          notStarted: 'Басталған жоқ',
          routeId: 'Маршрут ID: #{id}',
          noRoute: 'Бұл күнге ашық маршрут жоқ',
          title: '{date} маршруты'
        },
        actions: {
          start: 'Маршрутты бастау',
          close: 'Маршрутты жабу'
        },
        stats: {
          deliveries: 'Жеткізулер',
          amount: 'Сомасы',
          returns: 'Қайтарулар',
          pieces: 'дана'
        },
        clients: {
          title: 'Жеткізу нүктелері',
          subtitle: 'Жүру реті',
          empty: 'Бүгінге бекітілген клиенттер жоқ',
          client: 'Клиент',
          noAddress: 'Мекенжай көрсетілмеген',
          status: {
            delivered: 'Жеткізілді',
            waiting: 'Күтуде'
          },
          amount: 'Сомасы: {amount} ₸',
          debt: 'Қарыз: {amount} ₸',
          orderBadge: 'Өтінім #{id}: {amount} ₸',
          moreOrders: 'Тағы {count}',
          createDelivery: 'Жеткізуді құру',
          createDeliveryFromOrder: 'Өтінім бойынша жеткізу',
          completed: 'Аяқталды'
        },
        inventory: {
          title: 'Көліктегі тауар',
          empty: 'Көлік бос. Қоймадан жүктеуді сұраңыз.',
          product: 'Тауар',
          sku: 'Артикул: #{id}',
          pieces: 'дана',
          restock: 'Толықтыруды сұрау'
        },
        restockModal: {
          title: 'Толықтыруды сұрау',
          description: 'Көлікке қосымша тауар жүктеу үшін наубайшыға сұраныс жіберіңіз.',
          commentLabel: 'Сұранысқа түсініктеме',
          commentPlaceholder: 'Мысалы: Кәдімгі нан - 20 дана, Батон - 10 дана',
          cancel: 'Болдырмау',
          submit: 'Сұранысты жіберу',
          noCommentAlert: 'Сұраныс мәтінін енгізіңіз.',
          successAlert: 'Толықтыру сұранысы жіберілді.'
        },
        alerts: {
          adminCannotStart: 'Әкімші маршрутты жеткізулерді басқару бөлімінен нақты жүргізуші үшін ашуы керек.',
          cannotStart: 'Маршрутты бастау мүмкін болмады. Ол қазірдің өзінде ашық болуы мүмкін.',
          closeConfirm: 'Маршрут пен ауысымды жапқыңыз келетініне сенімдісіз бе? Осы күнге арналған барлық жеткізулер бұғатталады.',
          closeError: 'Маршрутты жабу кезінде қате орын алды.',
          restockError: 'Толықтыру сұранысын жіберу мүмкін болмады.'
        }
      },
      delivery: {
        title: 'Жеткізуді құру',
        back: 'Оралу',
        clientInfo: {
          title: 'Клиент туралы ақпарат',
          name: 'Атауы',
          debt: 'Қарыз'
        },
        order: {
          title: 'Клиент өтінімі #{id}',
          description: 'Өтінімдегі тауарлар жеткізуге автоматты қойылды. Қажет болса нақты санын өзгертуге болады.',
          estimatedTotal: 'Өтінім сомасы',
          itemsCount: 'Позициялар'
        },
        products: {
          title: 'Жеткізуге арналған тауарлар',
          empty: 'Көлікте жеткізуге арналған тауарлар жоқ',
          product: 'Тауар',
          selectProduct: 'Тауарды таңдаңыз',
          inStock: 'Көлікте: {quantity}',
          quantity: 'Саны',
          price: 'Бағасы',
          returnQty: 'Қайтару',
          returnReason: 'Қайтару себебі',
          returnReasons: {
            stale: 'Кепкен',
            damaged: 'Зақымдалған',
            other: 'Басқа'
          },
          add: 'Тауар қосу'
        },
        payment: {
          title: 'Төлем',
          total: 'Төлеуге барлығы:',
          method: 'Төлем тәсілі',
          methods: {
            cash: 'Қолма-қол',
            kaspi: 'Kaspi',
            debt: 'Қарызға',
            mixed: 'Аралас'
          },
          paidAmount: 'Төленген сома',
          cash: 'Қолма-қол',
          kaspi: 'Kaspi'
        },
        submit: 'Жеткізуді растау',
        submitting: 'Жіберілуде...',
        alerts: {
          noClient: 'Клиент көрсетілмеген',
          orderClientMismatch: 'Өтінім таңдалған клиентке тиесілі емес.',
          adminNoRoute: 'Бұл клиенттің жүргізушісі үшін таңдалған күнге белсенді маршрут жоқ.',
          driverNoRoute: 'Таңдалған күнге белсенді маршрут жоқ. Маршрутты бастаңыз.',
          loadError: 'Деректерді жүктеу қатесі. Қайта көріңіз.',
          submitError: 'Жеткізуді сақтау кезінде қате орын алды'
        }
      },
      returns: {
        title: 'Маршрут бойынша қайтарулар',
        subtitle: 'Клиенттерден қайтарылған нанды тіркеу',
        refresh: 'Жаңарту',
        back: 'Маршрутқа оралу',
        empty: {
          title: 'Қайтаратын жеткізулер жоқ',
          subtitle: 'Алдымен белсенді маршрутта клиентке жеткізуді рәсімдеңіз.'
        },
        client: 'Клиент',
        noAddress: 'Мекенжай көрсетілмеген',
        delivery: 'Жеткізу #{id}',
        deliveredItems: 'Жеткізілген тауарлар',
        product: 'Тауар',
        returned: 'Қайтарылды: {total} ішінен {returned}',
        pieces: 'дана',
        createReturn: 'Қайтаруды рәсімдеу',
        selectProduct: 'Тауарды таңдаңыз',
        available: 'қолжетімді {quantity} дана',
        quantity: 'Саны',
        reasons: {
          stale: 'Кепкен',
          damaged: 'Зақымдалған',
          other: 'Басқа'
        },
        submit: 'Қайтаруды тіркеу',
        submitting: 'Сақталуда...',
        alerts: {
          noRoute: 'Бүгінге белсенді маршрут жоқ.',
          loadError: 'Қайтару үшін жеткізулерді жүктеу мүмкін болмады.',
          invalidInput: 'Тауарды таңдап, қайтару санын көрсетіңіз.',
          exceedsLimit: 'Қайтару саны жеткізу бойынша қолжетімді қалдықтан асып кетті.',
          submitError: 'Қайтаруды сақтау мүмкін болмады.'
        }
      }
    },
    adminOrders: {
      title: 'Клиент тапсырыстары',
      subtitle: 'Клиенттерден түскен тапсырыстарды басқару',
      date: 'Жеткізу күні',
      status: 'Мәртебесі',
      client: 'Клиент',
      deliveryDate: 'Жеткізу',
      amount: 'Сома',
      items: 'Тапсырыс құрамы',
      comment: 'Пікір',
      empty: {
        title: 'Тапсырыстар жоқ',
        description: 'Сұранысыңыз бойынша тапсырыстар табылған жоқ',
      },
      statuses: {
        pending: 'Жаңа',
        approved: 'Расталған',
        delivered: 'Жеткізілді',
        cancelled: 'Бас тартылды',
      },
      actions: {
        approve: 'Растау',
        reject: 'Қабылдамау',
      }
    },
    adminVehicles: {
      title: 'Автокөліктер анықтамалығы',
      subtitle: 'Шығындарды есепке алу үшін көлік паркін басқару',
      add: 'Авто қосу',
      edit: 'Өңдеу',
      delete: 'Жою',
      name: 'Атауы / Маркасы',
      licensePlate: 'Мем. нөмір',
      status: 'Мәртебесі',
      active: 'Белсенді',
      inactive: 'Белсенді емес',
      empty: 'Автокөліктер табылмады',
      placeholders: {
        name: 'Мысалы: Lada Largus',
        licensePlate: 'Мысалы: 123 ABC 01',
      },
      modals: {
        add: 'Автокөлікті қосу',
        edit: 'Автокөлікті өңдеу',
        save: 'Сақтау',
        cancel: 'Болдырмау',
      }
    },
  }
};

const storageKey = 'locale';
const fallbackLocale: Locale = 'ru';
const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;

const listeners = new Set<(locale: Locale) => void>();
let currentLocale: Locale = savedLocale === 'kz' || savedLocale === 'ru' ? savedLocale : fallbackLocale;

const resolveMessage = (tree: MessageTree, path: string): string | null => {
  const value = path.split('.').reduce<string | MessageTree | undefined>((current, segment) => {
    if (!current || typeof current === 'string') {
      return undefined;
    }
    return current[segment];
  }, tree);

  return typeof value === 'string' ? value : null;
};

export const setLocale = (nextLocale: Locale) => {
  currentLocale = nextLocale;
  localStorage.setItem(storageKey, nextLocale);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = nextLocale === 'kz' ? 'kk' : 'ru';
  }
  listeners.forEach((listener) => listener(nextLocale));
};

if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLocale === 'kz' ? 'kk' : 'ru';
}

export const useI18n = () => {
  const [activeLocale, setActiveLocale] = useState<Locale>(currentLocale);

  useEffect(() => {
    listeners.add(setActiveLocale);
    return () => {
      listeners.delete(setActiveLocale);
    };
  }, []);

  const t = (path: string, replacements: Record<string, string | number> = {}) => {
    const message = resolveMessage(messages[activeLocale], path)
      || resolveMessage(messages[fallbackLocale], path)
      || path;

    return Object.entries(replacements).reduce((text, [key, value]) => {
      return text.replaceAll(`{${key}}`, String(value));
    }, message);
  };

  return {
    locale: activeLocale,
    localeLabel: activeLocale.toUpperCase(),
    setLocale,
    t,
  };
};
