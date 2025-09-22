/***************************************************************/
/******************** Hàm show/hide popup **********************/

// const { send } = require("vite");

/***************************************************************/
let STATE = {};
function togglePopup(id, show = true) {
  // $("#" + id).css("display", show ? "flex" : "none");
  $("#" + id).toggleClass("d-none", !show);
}

async function sendRequest(payload, mode="prod") {
  showAjaxIndicator();
  let endpoints = {
    "dev": "https://script.google.com/macros/s/AKfycbwszbYjPHiVihhwLPKW3SwBHZuGRTkG79wYgxYxxvg/dev",
    "prod": "https://script.google.com/macros/s/AKfycbxoXngbg1GepifFTZD1TMKiBfnx_n2Q1s8ysSTxzqWmwiaZqWLXoj1dTIaf_K00-X78/exec"
  }
  try {
    if (!payload.password) {
      payload.jwt = localStorage.getItem("jwt") || "";
    }
    const data = await $.ajax({
      url: endpoints[mode],
      method: "POST",
      data: JSON.stringify(payload)
    });
    hideAjaxIndicator();
    return data;
  } catch (error) {
    console.error("Error:", error);
    hideAjaxIndicator();
    throw error;
  }
}

function setupSidebar() {
  // Append HTML structure
  if (!$('#main-container').length) {
    $('body').prepend(`
      <div id="main-container" class="d-flex mw-100">
        <div id="sidebar-container" class="d-flex" style="position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000;">
          <!-- Sidebar -->
          <nav class="sidebar d-flex flex-column flex-shrink-0 p-2 text-white bg-dark sidebar-expanded" id="sidebar">
            <div class="logo mb-3">
              <img src="https://via.placeholder.com/40" class="rounded-circle" alt="Logo">
            </div>
            <ul class="nav nav-pills flex-column mb-auto">
              <li><a href="#customers" class="nav-link text-white"><i class="bi bi-person"></i> <span class="sidebar-text">Khách hàng</span></a></li>
              <li><a href="#suppliers" class="nav-link text-white"><i class="bi bi-truck"></i> <span class="sidebar-text">Nhà cung cấp</span></a></li>
              <li><a href="#products" class="nav-link text-white"><i class="bi bi-box"></i> <span class="sidebar-text">Sản phẩm</span></a></li>
              <li><a href="#shipping" class="nav-link text-white"><i class="bi bi-geo-alt"></i> <span class="sidebar-text">Đơn vị vận chuyển</span></a></li>
              <li><a href="#support" class="nav-link text-white"><i class="bi bi-chat-dots"></i> <span class="sidebar-text">CSKH - Báo giá</span></a></li>
              <li><a href="#orders" class="nav-link text-white"><i class="bi bi-receipt"></i> <span class="sidebar-text">Đơn hàng</span></a></li>
            </ul>
            <div class="bottom mt-auto d-flex flex-column align-items-center">
              <img src="https://via.placeholder.com/40" class="rounded-circle mb-2 avatar" alt="Avatar">
              <button class="btn btn-outline-light btn-sm logout-btn" onclick="doLogout()"><i class="bi bi-box-arrow-right"></i> <span class="logout-text">Logout</span></button>
            </div>
          </nav>
        </div>
      </div>
    `);
  };

  // Ensure a mobile sidebar toggle (burger) exists and bind it
  if (!$('#sidebarCollapse').length) {
    $('#main-container').prepend('<button id="sidebarCollapse" class="btn btn-primary d-md-none" style="position:fixed; top:10px; left:10px; z-index:1100;"><i class="bi bi-list"></i></button>');
  }

  // Bind click events to sidebar links
  $('#sidebar .nav-link').on('click', function(e) {
    e.preventDefault();
    const pageText = $(this).find('.sidebar-text').text().trim();
    const page = pageText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setActivePage.call(this, page);
  });

  $('#sidebarCollapse').off('click').on('click', function () {
    // On small screens just toggle visibility
    if (window.matchMedia('(max-width: 768px)').matches) {
      $('#sidebar').toggleClass('d-none');
      return;
    }

    // On desktop toggle collapsed/expanded state (apply to both container and nav)
    $('#sidebar').toggleClass('sidebar-collapsed sidebar-expanded');
    $('#sidebar-container').toggleClass('sidebar-collapsed sidebar-expanded');
  });

  // Event handlers
  if (!('ontouchstart' in window)) {
    // On PC, show collapsed sidebar by default and expand on hover
    $('#sidebar').addClass('sidebar-collapsed').removeClass('sidebar-expanded');
    $('#sidebar').hover(
      function() { 
        $(this).removeClass('sidebar-collapsed').addClass('sidebar-expanded');
      },
      function() { 
        $(this).removeClass('sidebar-expanded').addClass('sidebar-collapsed');
      }
    );
  } 
  // else {
  //   // On mobile, toggle on click
  //   $('#sidebarCollapse').on('click', function () {
  //     // $('#sidebar').toggleClass('d-none');
  //     $(this).removeClass('sidebar-expanded').addClass('sidebar-collapsed');
  //   });
  // }

  // Logout function (placeholder)
  window.doLogout = function() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("savedUsername");
    location.reload();
  };

  if (!$('#app').length) {
    const sidebarWidth = $('#sidebar').length ? $('#sidebar').outerWidth() : 250;
    $('#main-container').append(`<div id="app" style="margin-left: ${sidebarWidth}px; width: calc(100% - ${sidebarWidth}px);"></div>`);
  }

  $("#sidebar .nav-link")[0].click(); // Activate first link by default 
}

function saveUsername(jwt) {
  const $usernameInput = $("#Username");
  const $rememberCheckbox = $("#remember-me");

  if ($rememberCheckbox.prop("checked")) {
    localStorage.setItem("savedUsername", $usernameInput.val());
    localStorage.setItem("jwt", jwt);
  } else {
    localStorage.removeItem("savedUsername");
    localStorage.removeItem("jwt");
  }
}

function loadScriptsAfterLogin(scriptUrls) {
    const promises = scriptUrls.map(url => $.getScript(url));
    return Promise.all(promises);
}

function loadApp() {
  hideLoading();
  loadScriptsAfterLogin(["/src/customers.js", "/src/utility.js"]).then(() => {
    $(".login-box").hide();
    // Switch from centered login layout to top-aligned app layout using Bootstrap utilities
    $('body').removeClass('vh-100 justify-content-center align-items-center').addClass('align-items-start pt-3');
    setupSidebar();
  })
}

function unloadApp() {
  hideLoading();
  $(".login-box").show();
  // Revert to centered login layout (Bootstrap utilities)
  $('body').removeClass('align-items-start pt-3').addClass('vh-100 justify-content-center align-items-center');
  $("#app").empty();
  $('#sidebar-container').remove();
}


function loadUsername() {
  const savedUsername = localStorage.getItem("savedUsername");
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    unloadApp();
    return;
  }
  showLoading("Đang tự động đăng nhập...");
  if (savedUsername) {
    $("#Username").val(savedUsername);
    $("#remember-me").prop("checked", true);
  }

  return sendRequest({ action: "login", jwt: jwt}).then(result => {
    if (result && result.success) {
      loadApp();
      STATE.customerSheetData = result.customerData;
      STATE.customerSheetConfig = result.customerConfig;
    } else {
      unloadApp();
    }
  });
}

function showLoading(text = "Đang tải...") {
  if (!$('#loading-overlay').length) {
    $('body').append(`
      <div id="loading-overlay" class="d-flex justify-content-center align-items-center position-fixed w-100 h-100" style="top:0; left:0; background-color: rgba(0,0,0,0.5); z-index: 9999; display: none;">
        <div class="text-center text-white">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div id="loading-text" class="mt-2">${text}</div>
        </div>
      </div>
    `);
  } else {
    $('#loading-text').text(text);
  }
  $('#loading-overlay').toggleClass("d-none", false);
}

// Add a thin green indicator bar at the top
if (!$('#ajax-indicator').length) {
  $('body').prepend('<div id="ajax-indicator" class="bg-success" style="height: 4px; width: 100%; position: fixed; top: 0; left: 0; z-index: 10000; display: none;"></div>');
}

function showAjaxIndicator() {
  $('#ajax-indicator').show();
}

function hideAjaxIndicator() {
  $('#ajax-indicator').hide();
}

function setActivePage() {
  $('#sidebar .nav-link').removeClass('active');
  let id = $(this).attr('href').replace('#','');
  $(this).addClass('active');
  console.log('Active page:', id);
  STATE.activePage = {
    key: id,
    label: $(this).find('.sidebar-text').text().trim()
  }
  switch(id) {
    case 'customers':
      setupCustomers();
      break;
    default:
      $("#app").html("<h1>Quà tặng Phương Trinh</h1>");
      break;
  }
  // Optionally, load content based on activePage here
}

// function setupSidebar() {
//   // Append HTML structure
//   if (!$('#sidebar-container').length) {
//     $('body').prepend(`
//       <div id="sidebar-container" class="d-flex" style="position: fixed; left: 0; top: 0; height: 100vh; z-index: 1000;">
//         <!-- Sidebar -->
//         <nav class="sidebar d-flex flex-column flex-shrink-0 p-2 text-white bg-dark sidebar-expanded" id="sidebar">
//           <div class="logo mb-3">
//             <img src="https://via.placeholder.com/40" class="rounded-circle" alt="Logo">
//           </div>
//           <ul class="nav nav-pills flex-column mb-auto">
//             <li><a href="#customers" class="nav-link text-white"><i class="bi bi-person"></i> <span class="sidebar-text">Khách hàng</span></a></li>
//             <li><a href="#suppliers" class="nav-link text-white"><i class="bi bi-truck"></i> <span class="sidebar-text">Nhà cung cấp</span></a></li>
//             <li><a href="#products" class="nav-link text-white"><i class="bi bi-box"></i> <span class="sidebar-text">Sản phẩm</span></a></li>
//             <li><a href="#shipping" class="nav-link text-white"><i class="bi bi-geo-alt"></i> <span class="sidebar-text">Đơn vị vận chuyển</span></a></li>
//             <li><a href="#support" class="nav-link text-white"><i class="bi bi-chat-dots"></i> <span class="sidebar-text">CSKH - Báo giá</span></a></li>
//             <li><a href="#orders" class="nav-link text-white"><i class="bi bi-receipt"></i> <span class="sidebar-text">Đơn hàng</span></a></li>
//           </ul>
//           <div class="bottom mt-auto d-flex flex-column align-items-center">
//             <img src="https://via.placeholder.com/40" class="rounded-circle mb-2 avatar" alt="Avatar">
//             <button class="btn btn-outline-light btn-sm logout-btn" onclick="doLogout()"><i class="bi bi-box-arrow-right"></i> <span class="logout-text">Logout</span></button>
//           </div>
//         </nav>
//     `);
//   }

//   // Bind click events to sidebar links
//   $('#sidebar .nav-link').on('click', function(e) {
//     e.preventDefault();
//     const pageText = $(this).find('.sidebar-text').text().trim();
//     const page = pageText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
//     setActivePage.call(this, page);
//   });

//   // Ensure a mobile sidebar toggle (burger) exists and bind it
//   if (!$('#sidebarCollapse').length) {
//     $('body').prepend('<button id="sidebarCollapse" class="btn btn-primary d-md-none" style="position:fixed; top:10px; left:10px; z-index:1100;"><i class="bi bi-list"></i></button>');
//   }
//   $('#sidebarCollapse').off('click').on('click', function () {
//     // On small screens just toggle visibility
//     if (window.matchMedia('(max-width: 768px)').matches) {
//       $('#sidebar').toggleClass('d-none');
//       return;
//     }

//     // On desktop toggle collapsed/expanded state (apply to both container and nav)
//     $('#sidebar').toggleClass('sidebar-collapsed sidebar-expanded');
//     $('#sidebar-container').toggleClass('sidebar-collapsed sidebar-expanded');
//   });

//   // Event handlers
//   if (!('ontouchstart' in window)) {
//     // On PC, show collapsed sidebar by default and expand on hover
//     $('#sidebar').addClass('sidebar-collapsed').removeClass('sidebar-expanded');
//     $('#sidebar').hover(
//       function() { 
//         $(this).removeClass('sidebar-collapsed').addClass('sidebar-expanded');
//       },
//       function() { 
//         $(this).removeClass('sidebar-expanded').addClass('sidebar-collapsed');
//       }
//     );
//   } 
//   // else {
//   //   // On mobile, toggle on click
//   //   $('#sidebarCollapse').on('click', function () {
//   //     // $('#sidebar').toggleClass('d-none');
//   //     $(this).removeClass('sidebar-expanded').addClass('sidebar-collapsed');
//   //   });
//   // }

//   // Logout function (placeholder)
//   window.doLogout = function() {
//     localStorage.removeItem("jwt");
//     localStorage.removeItem("savedUsername");
//     location.reload();
//   };

//   $("#sidebar .nav-link")[0].click(); // Activate first link by default 
// }


$(document).ready(function () {
  // Hide popups initially
  ["change-password-popup", "forgot-password-popup"].forEach(id => {
    togglePopup(id, false);
    console.log("run toggle")
  });

  // Forgot password link
  $(".forgot-link").on("click", function (e) {
    e.preventDefault();
    console.log("clicked forgot")
    togglePopup("forgot-password-popup");
  });

  $("#loginBtn").on("click", function() {
    doLogin();
  })

  // Load saved username
  loadUsername();
});

/***************************************************************/
/******************** Hàm đăng nhập ****************************/
/***************************************************************/
function doLogin() {
  const username = $("#Username").val().trim();
  const password = $("#Password").val().trim();

  if (!username || !password) {
    // alert("Vui lòng nhập đầy đủ Username và Password!");
    swal.fire({
      title: "Thông báo",
      text: "Vui lòng nhập đầy đủ Username và Password!",
      icon: "warning"
    });
    return;
  }

  sendRequest({ action: "login", username: username, password: password }).then(result => {
    if (result.success) {
      console.log(result.jwt);
      saveUsername(result.jwt);
      if (result.firstLogin) {
        showChangePasswordPopup();
      } else {
        loadApp();
      }
    } else {
      swal.fire({
        title: "Thông báo",
        text: "Sai Username hoặc Password, vui lòng thử lại!",
        icon: "warning"
      });
    }
  })
}

/***************************************************************/
/******************** Hàm đổi mật khẩu *************************/
/***************************************************************/
function showChangePasswordPopup() { togglePopup("change-password-popup"); }
function hideChangePasswordPopup() { togglePopup("change-password-popup", false); }

function doChangePassword(e) {
  e.preventDefault();

  const newPass = $("#new-password").val().trim();
  const confirmPass = $("#confirm-password").val().trim();
  const uid = $("#Username").val().trim();

  if (newPass !== confirmPass) {
    // alert("Mật khẩu xác nhận không khớp!");
    swal.fire({
      title: "Thông báo",
      text: "Mật khẩu xác nhận không khớp!",
      icon: "warning"
    });
    return;
  }

  sendRequest({ action: "changePassword", uid: uid, newPass: newPass }).then(res => {
    if (res.success) {
      hideChangePasswordPopup();
      $("#Password, #new-password, #confirm-password").val("");
      // alert("Đổi mật khẩu thành công, bạn sẽ được chuyển đến màn hình chính!");
      swal.fire("Thông báo", "Đổi mật khẩu thành công", "success")
    } else {
      // alert("Có lỗi khi đổi mật khẩu, vui lòng thử lại!");
      swal.fire("Thông báo", "Có lỗi khi đổi mật khẩu, vui lòng thử lại!", "error");
    }
  });
}

/***************************************************************/
/******************** Hàm quên mật khẩu ************************/
/***************************************************************/
function showForgotPasswordPopup() { togglePopup("forgot-password-popup"); }
function hideForgotPasswordPopup() { togglePopup("forgot-password-popup", false); }

function doForgotPassword(e) {
  e.preventDefault();

  const emailOrUid = $("#emailOrUid-ResetPassword").val().trim();
  if (!emailOrUid) {
    // alert("Vui lòng nhập Username hoặc Email!");
    swal.fire("Thông báo","Vui lòng nhập Username hoặc Email!", "warning");
    return;
  }

  sendRequest({ action: "forgotPassword", emailOrUid: emailOrUid }).then(res => {
    if (res.success) {
      swal.fire("Thông báo", "Yêu cầu đã được gửi. Vui lòng kiểm tra email hoặc liên hệ Admin!", "success");
      hideForgotPasswordPopup();
    } else {
      swal.fire("Thông báo", "Không tìm thấy tài khoản hoặc email!", "warning");
    }
  });
}

/***************************************************************/
/******************** Enter-to-submit *************************/
/***************************************************************/
$(document).on("keydown", function (e) {
  if (e.key !== "Enter") return;
  const $active = $(document.activeElement);
  // if (!$active.is("input, textarea")) return;

  e.preventDefault();
  const $container = $active.closest("form, .popup, .login-box");
  const $btn = $container.find("button[data-default], button[type='submit'], button, input[type='submit']").first();
  if ($btn.length) $btn.click();
});

/***************************************************************/
/******************** Toggle password **************************/
/***************************************************************/
function togglePassword(id, el) {
  const $input = $("#" + id);
  if (!$input.length) return;

  const $icon = $(el).find(".material-icons");

  if ($input.attr("type") === "password") {
    $input.attr("type", "text");
    $icon.text("visibility_off");
  } else {
    $input.attr("type", "password");
    $icon.text("visibility");
  }
  $input.focus();
}