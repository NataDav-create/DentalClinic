$(function () {
  var modal = $(".modal"),
    modalBtn = $("[data-toggle=modal]"),
    closeBtn = $(".modal__close"),
    closeVk = $(".vk__close"),
    modalVk = $(".vk");

  $(this).keydown(function (event) {
    if (event.which == 27) {
      modalVk.removeClass("vk--visible");
      $("body").css("overflow", "auto");
    }
  });
  $(document).on("click", function (e) {
    if (modalVk.is(e.target)) {
      modalVk.toggleClass("vk--visible");
      $("body").css("overflow", "auto");
    }
  });
  closeVk.on("click", function () {
    modalVk.removeClass("vk--visible");
    $("body").css("overflow", "auto");
  });

  modalBtn.on("click", function () {
    modal.toggleClass("modal--visible");
    $("body").css("overflow", "hidden");
  });

  closeBtn.on("click", function () {
    modal.toggleClass("modal--visible");
    $("body").css("overflow", "auto");
  });
  // close esc
  $(this).keydown(function (event) {
    if (event.which == 27) {
      modal.removeClass("modal--visible");
      $("body").css("overflow", "auto");
    }
  });
  $(document).on("click", function (e) {
    if (modal.is(e.target)) {
      modal.removeClass("modal--visible");
      $("body").css("overflow", "auto");
    }
  });

  $(window).scroll(function () {
    if ($(this).scrollTop() > 40) {
      $("#topBtn").fadeIn();
    } else {
      $("#topBtn").fadeOut();
    }
  });

  $("#topBtn").click(function () {
    $("html, body").animate({
      scrollTop: 0
    }, 1000);
    return false;
  });

  $(".menu-item").on("click", function () {
    $(this).parents("menu").children().removeClass("active");

    $(this).parent().addClass("active");
  });

  $(".header-btn").on("click", function () {
    $(".mobile__menu").addClass("active");
    $("body").css("overflow", "hidden");
  });

  $(".mobile__close-btn").on("click", function () {
    $(".mobile__menu").removeClass("active");
    $("body").css("overflow", "auto");
  });
  $(".mobile__link").on("click", function () {
    $(".mobile__menu").removeClass("active");
    $("body").css("overflow", "auto");
  });

  // map .......................

  //Переменная для включения/отключения индикатора загрузки
  var spinner = $(".map-wrapper").children(".loader");
  //Переменная для определения была ли хоть раз загружена Яндекс.Карта (чтобы избежать повторной загрузки при наведении)
  var check_if_load = false;
  //Необходимые переменные для того, чтобы задать координаты на Яндекс.Карте
  var myMapTemp, myPlacemarkTemp;

  //Функция создания карты сайта и затем вставки ее в блок с идентификатором &#34;map-yandex&#34;
  function init() {
    var myMapTemp = new ymaps.Map("map", {
      center: [55.78278, 37.650253], // координаты центра на карте
      zoom: 11, // коэффициент приближения карты
      controls: ["zoomControl", "fullscreenControl"], // выбираем только те функции, которые необходимы при использовании
    });
    var myPlacemarkTemp = new ymaps.Placemark(
      myMapTemp.getCenter(), {
        balloonContent: "Вход со двора ",
      }, {
        // Опции.
        // Необходимо указать данный тип макета.
        iconLayout: "default#image",
        // Своё изображение иконки метки.
        iconImageHref: "img/pin.svg",
        // Размеры метки.
        iconImageSize: [30, 42],
        // Смещение левого верхнего угла иконки относительно
        // её "ножки" (точки привязки).
        iconImageOffset: [-40, 0],
      }
    );
    myMapTemp.geoObjects.add(myPlacemarkTemp); // помещаем флажок на карту
    myMapTemp.behaviors.disable("scrollZoom");
    // Получаем первый экземпляр коллекции слоев, потом первый слой коллекции
    var layer = myMapTemp.layers.get(0).get(0);

    // Решение по callback-у для определения полной загрузки карты
    waitForTilesLoad(layer).then(function () {
      // Скрываем индикатор загрузки после полной загрузки карты
      spinner.removeClass("is-active");
    });
  }

  // Функция для определения полной загрузки карты (на самом деле проверяется загрузка тайлов)
  function waitForTilesLoad(layer) {
    return new ymaps.vow.Promise(function (resolve, reject) {
      var tc = getTileContainer(layer),
        readyAll = true;
      tc.tiles.each(function (tile, number) {
        if (!tile.isReady()) {
          readyAll = false;
        }
      });
      if (readyAll) {
        resolve();
      } else {
        tc.events.once("ready", function () {
          resolve();
        });
      }
    });
  }

  function getTileContainer(layer) {
    for (var k in layer) {
      if (layer.hasOwnProperty(k)) {
        if (
          layer[k] instanceof ymaps.layer.tileContainer.CanvasContainer ||
          layer[k] instanceof ymaps.layer.tileContainer.DomContainer
        ) {
          return layer[k];
        }
      }
    }
    return null;
  }

  // Функция загрузки API Яндекс.Карт по требованию (в нашем случае при наведении)
  function loadScript(url, callback) {
    var script = document.createElement("script");

    if (script.readyState) {
      // IE
      script.onreadystatechange = function () {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      // Другие браузеры
      script.onload = function () {
        callback();
      };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  // Основная функция, которая проверяет когда мы навели на блок с классом &#34;ymap-container&#34;
  var ymap = function () {
    $(".map-wrapper").mouseenter(function () {
      if (!check_if_load) {
        // проверяем первый ли раз загружается Яндекс.Карта, если да, то загружаем

        // Чтобы не было повторной загрузки карты, мы изменяем значение переменной
        check_if_load = true;

        // Показываем индикатор загрузки до тех пор, пока карта не загрузится
        spinner.addClass("is-active");

        // Загружаем API Яндекс.Карт
        loadScript(
          "https://api-maps.yandex.ru/2.1/?apikey=4b73d6b3-9094-450c-9b3a-4f205cee0942&lang=ru_RU",
          function () {
            // Как только API Яндекс.Карт загрузились, сразу формируем карту и помещаем в блок с идентификатором &#34;map-yandex&#34;
            ymaps.load(init);
          }
        );
      }
    });
  };

  $(function () {
    //Запускаем основную функцию
    ymap();
  });

  ///validation of form
  $(".service__form").validate({
    errorClass: "invalid",
    errorElement: "div",
    rules: {
      // строчное правило, converted to {required:true}
      userName: {
        required: true,
        minlength: 2,
        maxlength: 10,
      },
      userPhone: {
        required: true,
        // minlength: 7
      },
      userArea: {
        required: true,
        minlength: 7,
      },
      // правило-объект
      userEmail: {
        required: true,
        email: true,
      },
    }, // сообщения
    messages: {
      userName: {
        required: "Name is required",
        minlength: "Name is not shorter then 2 letters",
      },
      userPhone: {
        required: "Phone is required",
        minlength: "Phone should be full",
      },
      userArea: {
        required: "Message is required",
        minlength: "Message should be not less then 7 letters",
      },
      userEmail: {
        required: "Email is required",
        email: "Email should be in format as example@gmail.com",
      },
    },
  });

  // E-mail Ajax Send
  $(".service__form").submit(function () {
    //Change
    event.preventDefault();
    var th = $(this);
    $.ajax({
      type: "POST",
      url: "mail.php", //Change
      data: th.serialize(),
    }).done(function () {
      $(".vk").addClass("vk--visible");
      // $("body").css("overflow", "hidden");
      $(form)[0].reset();
    });
    return false;
  });

  $(".modal__form").validate({
    errorClass: "invalid",
    errorElement: "div",
    rules: {
      // строчное правило, converted to {required:true}
      userName: {
        required: true,
        minlength: 2,
        maxlength: 10,
      },
      userPhone: {
        required: true,
        // minlength: 7
      },
      userArea: {
        required: true,
        minlength: 7,
      },
      // правило-объект
      userEmail: {
        required: true,
        email: true,
      },
      policyCheckbox: {
        required: true,
      },
    }, // сообщения
    messages: {
      userName: {
        required: "Name is required",
        minlength: "Name is not shorter then 2 letters",
      },
      userPhone: {
        required: "Phone is required",
        minlength: "Phone should be full",
      },
      userArea: {
        required: "Message is required",
        minlength: "Message should be not less then 7 letters",
      },
      userEmail: {
        required: "Email is required",
        email: "Email should be in format as example@gmail.com",
      },
      policyCheckbox: {
        required: "You have to agree with policy",
      },
    },

  });

  // E-mail Ajax Send
  $(".modal__form").submit(function () {
    //Change
    event.preventDefault();
    var th = $(this);
    $.ajax({
      type: "POST",
      url: "mail.php", //Change
      data: th.serialize(),
    }).done(function () {
      $(".modal").removeClass("modal--visible");
      $(".vk").addClass("vk--visible");
      // $("body").css("overflow", "hidden");
      $(form)[0].reset();
    });
    return false;
  });

  $(".check__form").validate({
    errorClass: "invalid",
    errorElement: "div",
    rules: {
      // строчное правило, converted to {required:true}
      userName: {
        required: true,
        minlength: 2,
        maxlength: 10,
      },
      userPhone: {
        required: true,
        // minlength: 7
      },
      userArea: {
        required: true,
        minlength: 7,
      },
      // правило-объект
      userEmail: {
        required: true,
        email: true,
      },
    }, // сообщения
    messages: {
      userName: {
        required: "Name is required",
        minlength: "Name is not shorter then 2 letters",
      },
      userPhone: {
        required: "Phone is required",
        minlength: "Phone should be full",
      },
      userArea: {
        required: "Message is required",
        minlength: "Message should be not less then 7 letters",
      },
      userEmail: {
        required: "Email is required",
        email: "Email should be in format as example@gmail.com",
      },
    },
  });

  // E-mail Ajax Send
  $(".check__form").submit(function () {
    //Change
    event.preventDefault();
    var th = $(this);
    $.ajax({
      type: "POST",
      url: "mail.php", //Change
      data: th.serialize(),
    }).done(function () {
      $(".vk").addClass("vk--visible");
      // $("body").css("overflow", "hidden");
      $(form)[0].reset();
    });
    return false;
  });

  $(".slider").slick({
    arrows: false,
    fade: true,
    loop: true,
    autoplay: 3000,
    dots: false,
  });
});

document.addEventListener("click", function (event) {
  let click = event.target.classList.value;
  if (click === "modal modal--visible") {
    modal.classList.remove("modal--visible");
  }
});

new WOW().init();