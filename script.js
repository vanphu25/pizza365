"use strict";

// * Tại một thời điểm, trạng thái của form luôn là 1 trong 4 trạng thái
// */
var gFORM_MODE_NORMAL = "Normal";
var gFORM_MODE_INSERT = "Insert";
var gFORM_MODE_UPDATE = "Update";
var gFORM_MODE_DELETE = "Delete";

// biến toàn cục cho trạng thái của form: mặc định ban đầu là trạng thái Normal
var gFormMode = gFORM_MODE_NORMAL;

$(document).ready(function () {
  var gDataObject = {
    orders: [],
    filterOrders: function (params) {
      var vFilterResult = [];
      vFilterResult = this.orders.filter(function (paramOrders) {
        // var vOrderState = false;
        var vOrderState = paramOrders.trangThai.includes(params.trangThai);
        // var vPizzaType = false;
        if (paramOrders.loaiPizza !== null) {
          var vPizzaType = paramOrders.loaiPizza.includes(params.loaiPizza);
        }
        return vOrderState && vPizzaType;
      });
      return vFilterResult;
    },
  };
  var gOrderState = ["open", "confirmed", "cancel"];
  var gPizzaType = ["hawaii", "bacon", "seafood"];
  var gCombo = {
    comBoSize: [
      {
        kichCo: "S",
        duongKinh: "20",
        soLuongSuon: "2",
        salad: "200",
        soLuongNuoc: "2",
        thanhTien: 150000,
      },
      {
        kichCo: "M",
        duongKinh: "25",
        soLuongSuon: "4",
        salad: "300",
        soLuongNuoc: "3",
        thanhTien: 200000,
      },
      {
        kichCo: "L",
        duongKinh: "30",
        soLuongSuon: "8",
        salad: "500",
        soLuongNuoc: "4",
        thanhTien: 250000,
      },
    ],
    getCombo: function (params) {
      var vFilterResult = [],
        vFilterResult = this.comBoSize.filter(function (paramSize) {
          var vSizeDetail = paramSize.kichCo.includes(params);
          return vSizeDetail;
        });
      return vFilterResult;
    },
  };

  var gObjectRequest = {
    kichCo: "",
    duongKinh: "",
    suon: "",
    salad: "",
    loaiPizza: "",
    idVourcher: "",
    idLoaiNuocUong: "",
    soLuongNuoc: "",
    hoTen: "",
    thanhTien: "",
    email: "",
    soDienThoai: "",
    diaChi: "",
    loiNhan: "",
  };

  var gOrderId = "";
  var gId = "";
  const gCOLUMN_ORDERID = 0;
  const gCOLUMN_KICH_CO = 1;
  const gCOLUMN_LOAI_PIZZA = 2;
  const gCOLUMN_NUOC_UONG = 3;
  const gCOLUMN_THANH_TIEN = 4;
  const gCOLUMN_HO_TEN = 5;
  const gCOLUMN_SO_DIEN_THOAI = 6;
  const gCOLUMN_TRANG_THAI = 7;
  const gCOLUMN_ACTION = 8;

  var gORDER_COL = [
    "orderId",
    "kichCo",
    "loaiPizza",
    "idLoaiNuocUong",
    "thanhTien",
    "hoTen",
    "soDienThoai",
    "trangThai",
    "action",
  ];

  var gOrderTable = $("#orders-table").DataTable({
    columns: [
      { data: gORDER_COL[gCOLUMN_ORDERID] },
      { data: gORDER_COL[gCOLUMN_KICH_CO] },
      { data: gORDER_COL[gCOLUMN_LOAI_PIZZA] },
      { data: gORDER_COL[gCOLUMN_NUOC_UONG] },
      { data: gORDER_COL[gCOLUMN_THANH_TIEN] },
      { data: gORDER_COL[gCOLUMN_HO_TEN] },
      { data: gORDER_COL[gCOLUMN_SO_DIEN_THOAI] },
      { data: gORDER_COL[gCOLUMN_TRANG_THAI] },
      { data: gORDER_COL[gCOLUMN_ACTION] },
    ],
    columnDefs: [
      {
        // định nghĩa lại cột action
        targets: gCOLUMN_ACTION,
        defaultContent: `
                <i class="fas fa-edit text-primary edit-user" style="cursor: pointer;" data-toggle="tooltip" title="Edit User">&nbsp;</i>
                <i class="fas fa-trash-alt text-danger delete-order" style="cursor: pointer;" data-toggle="tooltip" title="Delete User"></i>
              `,
      },
    ],
  });

  onPageLoading();

  //filter data
  $("#btn-filter").on("click", function () {
    onFilterBtnClick();
  });

  //click nút thêm user
  $("#btn-add-user").on("click", function () {
    $("#modal-user").modal("show");
  });

  $("#inp-combo").on("change", function () {
    var vInputCombo = $(this).val().toUpperCase();
    var comBoDetails = gCombo.getCombo(vInputCombo);
    if (comBoDetails[0] !== undefined) {
      showComboInModal(comBoDetails[0]);
    }
  });
  $("#inp-voucherid").on("change", function () {
    var vInputVoucherId = $(this).val();
    getVoucherDiscount(vInputVoucherId);
  });
  $("#btn-save-data").on("click", function () {
    onSaveBtnClick();
  });

  $("#btn-cancel").on("click", function () {
    resetDataModal();
    $("#modal-user").modal("hide");
  });
  //click edit button on table
  $("#orders-table").on("click", ".edit-user", function () {
    $("#modal-edit-user").modal("show");
    onEditOrderIconClick(this);
  });
  //click confirm button in modal edit
  $("#btn-confirm-order").on("click", function () {
    onConfirmBtnClick();
  });

  //click cancle button in modal edit
  $("#btn-cancel-order").on("click", function () {
    $("#modal-edit-user").modal("hide");
  });

  //click delete button on table
  $("#orders-table").on("click", ".delete-order", function () {
    $("#delete-confirm-modal").modal("show");
    onDeleteBtnClick(this);
  });

  // them su kien delete data
  $("#btn-confirm-delete").on("click", function () {
    onBtnConfirmDeleteOrderClick();
  });

  function onPageLoading() {
    //call API to get pizza data
    $.ajax({
      url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
      type: "GET",
      dataType: "json",
      success: function (res) {
        gDataObject.orders = res;
        console.log(gDataObject.orders);
        loadDataToTable(res);
      },
      error: function (error) {
        console.assert(error.responseText);
      },
    });

    loadDataToOrderStateSelect();
    loadDataToPizzaTypeSelect();
    loadDataToStateSelectInModal();
  }

  //load order data to table
  function loadDataToTable(paramOrdersData) {
    //Xóa toàn bộ dữ liệu đang có của bảng
    gOrderTable.clear();
    //Cập nhật data cho bảng
    gOrderTable.rows.add(paramOrdersData);
    //Cập nhật lại giao diện hiển thị bảng
    gOrderTable.draw();
  }

  //load data to orderState select
  function loadDataToOrderStateSelect() {
    var vOrderState = $("#select-trang-thai");
    var vStateOptions = $("<option/>", {
      text: "--- Chọn Trạng Thái ---",
      value: 0,
    }).appendTo(vOrderState);

    for (var bI = 0; bI < gOrderState.length; bI++) {
      const bState = gOrderState[bI];
      var bOrderState = $("<option/>", {
        text: bState,
        value: bState,
      }).appendTo(vOrderState);
    }
  }

  //load data to orderState select in Modal
  function loadDataToStateSelectInModal() {
    var vOrderState = $("#sel-trang-thai-edit");
    for (var bI = 0; bI < gOrderState.length; bI++) {
      const bState = gOrderState[bI];
      var bOrderState = $("<option/>", {
        text: bState,
        value: bState,
      }).appendTo(vOrderState);
    }
  }
  //load data to Pizza Type Select
  function loadDataToPizzaTypeSelect() {
    var vPizzaType = $("#select-loai-pizza");
    var vTypeOptions = $("<option/>", {
      text: "--- Chọn Loại Pizza ---",
      value: 0,
    }).appendTo(vPizzaType);

    for (var bI = 0; bI < gPizzaType.length; bI++) {
      const bType = gPizzaType[bI];
      var bPizzaType = $("<option/>", {
        text: bType,
        value: bType,
      }).appendTo(vPizzaType);
    }
  }

  //filter data
  function onFilterBtnClick() {
    var vOrderFilter = {
      trangThai: "",
      loaiPizza: "",
    };
    debugger;
    getFilterData(vOrderFilter);
    var vFilterResult = filterData(vOrderFilter);
    loadDataToTable(vFilterResult);
  }

  //get filter data
  function getFilterData(paramFilterData) {
    paramFilterData.trangThai = $("#select-trang-thai").val().toLowerCase();
    paramFilterData.loaiPizza = $("#select-loai-pizza").val().toLowerCase();
  }

  function filterData(paramOrder) {
    debugger;
    var vResult = [];
    vResult = gDataObject.filterOrders(paramOrder);
    return vResult;
  }

  function onSaveBtnClick() {
    //get data input modal
    getDataInModalForm(gObjectRequest);
    //validate data input
    var vCheck = validateDataInput(gObjectRequest);
    if (vCheck) {
      //post data to server
      insertNewUser();
    }
  }

  //get data in modal form when add new insert
  function getDataInModalForm(paramOrder) {
    paramOrder.kichCo = $("#inp-combo").val();
    paramOrder.duongKinh = $("#inp-duong-kinh").val();
    paramOrder.suon = $("#inp-suon").val();
    paramOrder.idLoaiNuocUong = $("#inp-do-uong").val();
    paramOrder.soLuongNuoc = $("#inp-so-luong-nuoc").val();
    paramOrder.idVourcher = $("#inp-voucherid").val();
    paramOrder.loaiPizza = $("#inp-loai-pizza").val();
    paramOrder.salad = $("#inp-salad").val();
    paramOrder.thanhTien = $("#inp-thanh-tien").val();
    paramOrder.hoTen = $("#inp-hoten").val();
    paramOrder.email = $("#inp-email").val();
    paramOrder.soDienThoai = $("#inp-sdt").val();
    paramOrder.diaChi = $("#inp-dia-chi").val();
    paramOrder.loiNhan = $("#inp-loi-nhan").val();
  }

  //validate datainput Modal
  function validateDataInput(paramValidateData) {
    var vResult = true;
    const vRegrex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (paramValidateData.hoTen == "") {
      alert("Tên không được bỏ trống!");
      vResult = false;
    } else if (paramValidateData.email == "") {
      alert("Email không được bỏ trống!");
      vResult = false;
    } else if (
      paramValidateData.email !== "" &&
      vRegrex.test(String(paramValidateData.email).toLowerCase()) === false
    ) {
      alert("Email không đúng định dạng!");
      vResult = false;
    } else if (paramValidateData.soDienThoai == "") {
      alert("Số điện thoại không được bỏ trống!");
      vResult = false;
    } else if (
      paramValidateData.soDienThoai !== "" &&
      isNaN(paramValidateData.soDienThoai)
    ) {
      alert("Số điện thoại không thể chứa kí tự!");
      vResult = false;
    } else if (paramValidateData.diaChi == "") {
      alert("Địa chỉ không được bỏ trống!");
      vResult = false;
    }
    return vResult;
  }

  //insert new user to server
  function insertNewUser() {
    $.ajax({
      url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
      data: JSON.stringify(gObjectRequest),
      type: "POST",
      contentType: "application/json",
      success: function (res) {
        console.log(res);
        gDataObject.orders.push(res);
        console.log(gDataObject.orders);
        loadDataToTable(gDataObject.orders);
        $("#modal-user").modal("hide");
        resetDataModal();
      },
      error: function (error) {
        console.assert(error.responseText);
      },
    });
  }

  //reset data in modal
  function resetDataModal() {
    //reset data modal
    $("#inp-orderid").val("");
    $("#inp-combo").val("");
    $("#inp-duong-kinh").val("");
    $("#inp-suon").val("");
    $("#inp-do-uong").val("");
    $("#inp-so-luong-nuoc").val("");
    $("#inp-voucherid").val("");
    $("#inp-loai-pizza").val("");
    $("#inp-salad").val("");
    $("#inp-thanh-tien").val("");
    $("#inp-giam-gia").val("");
    $("#inp-hoten").val("");
    $("#inp-email").val("");
    $("#inp-sdt").val("");
    $("#inp-dia-chi").val("");
    $("#inp-loi-nhan").val("");
    $("#inp-trang-thai").val("");
  }

  function onEditOrderIconClick(paramIconEdit) {
    gId = getIdDataFromButton(paramIconEdit);
    showDataToModalForm(gId);
  }

  // hàm dựa vào button detail (edit or delete) xác định đc id voucher
  function getIdDataFromButton(paramIcon) {
    var vTableRow = $(paramIcon).parents("tr");
    var vOrderRowData = gOrderTable.row(vTableRow).data();
    return vOrderRowData.id;
  }

  function getIndexFromOrderId(paramOrderId) {
    var vOrderIndex = -1;
    var vOrderFound = false;
    var vLoopIndex = 0;
    while (!vOrderFound && vLoopIndex < gDataObject.orders.length) {
      if (gDataObject.orders[vLoopIndex].id === paramOrderId) {
        vOrderIndex = vLoopIndex;
        vOrderFound = true;
      } else {
        vLoopIndex++;
      }
    }
    return vOrderIndex;
  }
  //show data to modal form
  function showDataToModalForm(paramOrder) {
    var vOrderIndex = getIndexFromOrderId(paramOrder);
    $("#inp-orderId-edit").val(gDataObject.orders[vOrderIndex].orderId);
    $("#inp-combo-edit").val(gDataObject.orders[vOrderIndex].kichCo);
    $("#inp-duong-kinh-edit").val(gDataObject.orders[vOrderIndex].duongKinh);
    $("#inp-suon-edit").val(gDataObject.orders[vOrderIndex].suon);
    $("#inp-do-uong-edit").val(gDataObject.orders[vOrderIndex].idLoaiNuocUong);
    $("#inp-so-luong-nuoc-edit").val(
      gDataObject.orders[vOrderIndex].soLuongNuoc
    );
    $("#inp-voucherid-edit").val(gDataObject.orders[vOrderIndex].idVourcher);
    $("#inp-loai-pizza-edit").val(gDataObject.orders[vOrderIndex].loaiPizza);
    $("#inp-salad-edit").val(gDataObject.orders[vOrderIndex].salad);
    $("#inp-thanh-tien-edit").val(gDataObject.orders[vOrderIndex].thanhTien);
    $("#inp-giam-gia-edit").val(gDataObject.orders[vOrderIndex].giamGia);
    $("#inp-hoten-edit").val(gDataObject.orders[vOrderIndex].hoTen);
    $("#inp-email-edit").val(gDataObject.orders[vOrderIndex].email);
    $("#inp-sdt-edit").val(gDataObject.orders[vOrderIndex].email);
    $("#inp-dia-chi-edit").val(gDataObject.orders[vOrderIndex].diaChi);
    $("#inp-loi-nhan-edit").val(gDataObject.orders[vOrderIndex].loiNhan);
    $("#inp-ngay-tao-don-edit").val(gDataObject.orders[vOrderIndex].ngayTao);
    $("#inp-ngay-cap-nhat-edit").val(
      gDataObject.orders[vOrderIndex].ngayCapNhat
    );
    $("#sel-trang-thai-edit")
      .val(gDataObject.orders[vOrderIndex].trangThai)
      .change();
  }

  function showComboInModal(paramDetails) {
    $("#inp-duong-kinh").val(paramDetails.duongKinh);
    $("#inp-suon").val(paramDetails.soLuongSuon);
    $("#inp-salad").val(paramDetails.salad);
    $("#inp-so-luong-nuoc").val(paramDetails.soLuongNuoc);
    $("#inp-thanh-tien").val(paramDetails.thanhTien);
  }

  //update trang thai don hang khi nhan nut confirm
  function onConfirmBtnClick() {
    //Thu thập dữ liệu trên modal
    var vEditState = $("#sel-trang-thai-edit").val();
    console.log(vEditState);
    $.ajax({
      url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId,
      type: "PUT",
      data: JSON.stringify({
        trangThai: vEditState,
      }),
      contentType: "application/json",
      success: function (res) {
        //call API to get pizza data
        $.ajax({
          url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
          type: "GET",
          dataType: "json",
          success: function (res) {
            gDataObject.orders = res;
            loadDataToTable(res);
          },
          error: function (error) {
            console.assert(error.responseText);
          },
        });
      },
      error: function (error) {
        console.assert(error.responseText);
      },
    });
    $("#modal-edit-user").modal("hide");
  }

  function onDeleteBtnClick(paramOrderId) {
    gId = getIdDataFromButton(paramOrderId);
  }

  //hàm xử lý sự kiện khi click confirm trên delete modal
  function onBtnConfirmDeleteOrderClick() {
    //xóa dữ liệu
    deleteOrder(gId);
    //load lại dữ liệu của bảng
    loadDataToTable(gDataObject.orders);
    //thông báo kết quả
    alert("Xóa dữ liệu thành công");
    //ẩn form đi
    $("#delete-confirm-modal").modal("hide");
    resetDataModal();
  }

  //hàm xóa order
  function deleteOrder(paramDeleteId) {
    var vIndex = getIndexFromOrderId(paramDeleteId);
    gDataObject.orders.splice(vIndex, 1);
  }

  //Call API to get Voucher
  function getVoucherDiscount(paramvoucherId) {
    $.ajax({
      url:
        "http://42.115.221.44:8080/devcamp-voucher-api/voucher_detail/" +
        paramvoucherId,
      type: "GET",
      dataType: "json",
      success: function (res) {
        console.log(res);
        var vdisCount = res.phanTramGiamGia;
        var vCurrentPrize = $("#inp-thanh-tien").val();
        var vPayment =
          parseInt(vCurrentPrize) - parseInt(vCurrentPrize * (vdisCount / 100));
        $("#inp-thanh-tien").val(vPayment);
      },
      error: function (error) {
        console.assert(error.responseText);
        alert("Mã voucher không đúng");
        $("#inp-voucherid").val("");
      },
    });
  }
});
