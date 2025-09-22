// customers.js
// Assumes Tabulator, Bootstrap 5, SweetAlert2, and jQuery are included in the HTML

function setupCustomers() {
    STATE.initDropdowns = false;
    let columns = [
        { formatter: "rowSelection", titleFormatter: "rowSelection", field: "rowSelection", hozAlign: "center", headerSort: false, width: 50, frozen: true },
        { title: "MÃ KH", field: "customerCode", required: true },
        { title: "TÊN SALES", field: "salesName", required: true },
        { title: "NGUỒN KH", field: "customerSource", required: true, input: "select" },
        { title: "MÔ HÌNH KD", field: "businessModel", required: true, input: "select" },
        { title: "NHÓM NGÀNH KD", field: "industryGroup", required: true, input: "select" },
        { title: "TÊN KH", field: "customerName", required: true },
        { title: "ĐỊA CHỈ", field: "address", required: true },
        { title: "PHƯỜNG/ XÃ/ ĐẶC KHU", field: "wardCommuneSpecialZone", required: true, input: "select" },
        { title: "TỈNH/ THÀNH", field: "provinceCity", required: true, input: "select" },
        { title: "MÃ SỐ THUẾ", field: "taxCode" },
        { title: "SĐT TỔ CHỨC", field: "organizationPhone" },
        { title: "NGƯỜI LH", field: "contactPerson" },
        { title: "SỐ DI ĐỘNG", field: "mobileNumber" },
        { title: "EMAIL", field: "email" },
        { title: "MIỀN", field: "region", input: "select" },
        { title: "VÙNG ĐỊA LÝ", field: "geographicalArea", input: "select" },
        { title: "Địa chỉ giao hàng", field: "shippingAddress", input: "select" },
        { title: "Người nhận", field: "recipient" },
        { title: "Di động", field: "recipientMobile" },
        { title: "Ghi chú về khách hàng", field: "customerNotes", editor: "textarea" },
        { title: "TRẠNG THÁI KH", field: "customerStatus", input: "select" },
        { title: "Account/ Lần cuối chỉnh sửa", field: "accountLastModified" }
    ];

    function replicateValue(sourceField, ...targetFields) {
        $(`#${sourceField}`).off("change").on("change", function () {
            const value = $(this).val();
            targetFields.forEach(targetField => {
                $(`#${targetField}`).val(value);
            })
        });
    }

    function markLabel(id, color = 'red') {
        $(`label[for="${id}"]`).css('color', color);
    }

    function validateInput() {
        let isValid = true;

        // Duplicate check based on customerName, address, taxCode
        const customerName = $('#customerName').val().trim();
        const address = $('#address').val().trim();
        const taxCode = $('#taxCode').val().trim();
        const existing = STATE.customerData.find(c =>
            String(c.customerName).trim() === customerName &&
            String(c.address).trim() === address &&
            String(c.taxCode).trim() === taxCode
        );
        if (existing) {
            Swal.fire("Thông báo", "Khách hàng với tên, địa chỉ và mã số thuế này đã tồn tại.", "error");
            isValid = false;
        }
        const email = $('#email').val().trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Swal.fire("Thông báo", "Email không hợp lệ.", "error");
            isValid = false;
        }

        return isValid;
    }

    // Add onChange listeners for validation (add this in openCustomerModal after modal show)
    // In openCustomerModal, after $('#customer-modal').modal('show'); add:
    columns.forEach(col => {
        if (col.required) {
            $(`#${col.field}`).on('input change', function () {
                const value = $(this).val();
                if (!value || !String(value).trim()) {
                    markLabel(col.field, 'red');
                } else {
                    markLabel(col.field, 'black');
                }
            });
        }
        if (["customerName", "address", "taxCode"].includes(col.field)) {
            $(`#${col.field}`).on('input change', function () {
                validateInput();
            });
        }
    });
    $('#email').on('input change', function () {
        const email = $(this).val();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            markLabel('email', 'red');
        } else {
            markLabel('email', 'black');
        }
    });

    // Also, update the submit handler in openCustomerModal to call validateInput:
    // In the $('#customer-form').on('submit', function(e) { ... } replace the beginning with:
    // e.preventDefault();
    // if (!validateInput(data.customerCode)) return;
    // const formData = new FormData(e.target);
    // ...

    function getRegion(specialZone) {
        let specialZoneIndex = STATE.customerConfig["PHƯỜNG/ XÃ/ ĐẶC KHU"]?.indexOf(specialZone);
        console.log(specialZoneIndex);
        console.log(STATE.customerConfig["TỈNH THÀNH"]?.[specialZoneIndex])
        if (specialZoneIndex !== undefined && specialZoneIndex >= 0) {
            return {
                provinceCity: STATE.customerConfig["TỈNH THÀNH"]?.[specialZoneIndex] || "",
                region: STATE.customerConfig["MIỀN"]?.[specialZoneIndex] || "",
                geographicalArea: STATE.customerConfig["VÙNG ĐỊA LÝ"]?.[specialZoneIndex] || ""
            }
        }
        return {}
    }

    function mapCustomerData(data) {
        let finalData = []
        let customerData = data.slice(1).filter(x => x[0] && x[1]) || [];
        let tableColumns = STATE.customerTable.getColumns().filter(x => x.getField() !== "rowSelection");
        customerData.forEach(row => {
            let record = {};
            tableColumns.forEach((col, i) => {
                const field = col.getField();
                record[field] = row[i];
            });
            finalData.push(record);
        })
        return finalData;
    }

    function updateTableData(rawData) {
        STATE.customerData = mapCustomerData(rawData);
        STATE.customerTable.setData(STATE.customerData);
    }

    async function getData(refresh = false) {
        showLoading();
        let [customersData, customersConfig] = [
            STATE.customerSheetData,
            STATE.customerSheetConfig
        ];
        if (refresh) {
            [customersData, customersConfig] = await Promise.all([
                sendRequest({ action: "khachhang.read" }),
                sendRequest({ action: "getCustomersConfig" })
            ]);
            customersData = customersData.data;
            customersConfig = customersConfig.data;
        }

        // STATE.customerData = arrayToObjects(customersData.data.filter(x => x[0] && x[1]) || []);
        STATE.customerData = [];
        STATE.customerConfig = arrayToConfig(customersConfig || []);
        updateTableData(customersData);
        hideLoading();
    }

    function initTable() {
        if (!$(".table-wrapper").length) {
            $("#app").html(`
                <div class="table-wrapper" style="overflow:auto;">
                </div>
            `);
        }
        $(".table-wrapper").empty();
        $(".table-wrapper").html(`
            <h4 id="table-title">${STATE.activePage.label}</h4>
            <div id="${STATE.activePage.key}-table"></div>
        `);

        // Sample data (replace with actual data source)
        const data = [
            // Add sample or load from API
        ];

        // Create Tabulator table with Bootstrap 5 theme
        // Create Tabulator with responsive behavior and horizontal scrolling fallback
        const customerTable = new Tabulator("#customers-table", {
            data: data,
            columns: columns,
            // Use fitData to allow columns to size to content but enable horizontal scroll in wrapper
            layout: "fitData",
            responsiveLayout: "collapse", // collapse columns into a details row when too narrow
            responsiveLayoutCollapseStartOpen: false,
            selectable: "checkbox",
            movableColumns: true,
            resizableColumns: true,
            tooltips: true,
            height: "600px", // set a fixed height to enable vertical scrolling inside table
            theme: "bootstrap5"
        });

        STATE.customerTable = customerTable;


        function addHandler() {
            let record = {};
            columns.forEach(col => {
                record[col.field] = "";
            })
            openCustomerModal(record);
        }

        function editHandler() {
            const selectedRows = customerTable.getSelectedRows();
            if (selectedRows.length === 1) {
                openCustomerModal(selectedRows[0].getData());
            } else {
                Swal.fire("Vui lòng chọn một dòng để sửa.");
            }
        }

        function deleteHandler() {
            const selectedRows = customerTable.getSelectedRows();
            if (selectedRows.length > 0) {
                Swal.fire({
                    title: "Thông báo",
                    text: "Bạn chắc chắn muốn xoá các dòng đã chọn",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Đồng ý"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        let result = await sendRequest({
                            action: "khachhang.delete",
                            ids: selectedRows.map(r => r.getData().customerCode)
                        })
                        updateTableData(result.data);
                        Swal.fire("Thông báo", "Các khách hàng đã chọn đã được xóa.", "success");
                    }
                });
            } else {
                Swal.fire("Vui lòng chọn ít nhất một hàng để xóa.");
            }
        }

        createTableControls(customerTable, addHandler, editHandler, deleteHandler);
    }
    initTable();
    setTimeout(() => {
        getData();
    }, 250)


    function initEvents() {
        $("#wardCommuneSpecialZone").on("change", function () {
            const specialZone = $(this).val();
            console.log(specialZone)
            let { provinceCity, geographicalArea, region } = getRegion(specialZone) || {};
            let address = $("#address").val() || "";
            $('#provinceCity').selectpicker("val", provinceCity || '');
            $('#geographicalArea').selectpicker("val", geographicalArea || '');
            $('#region').selectpicker("val", region || '');
            let shippingAddress = [
                address,
                specialZone,
                provinceCity
            ].join(", ");
            $('#shippingAddress').val(shippingAddress);
        });

        replicateValue("customerName", "contactPerson", "recipient");
        replicateValue("organizationPhone", "mobileNumber", "recipientMobile");
        replicateValue("address", "shippingAddress");
    }


    // Function to populate dropdowns from STATE.customerConfig
    function populateDropdowns() {
        try {
            const config = STATE.customerConfig;
            const dropdowns = {
                customerSource: "NGUỒN KH",
                businessModel: "MÔ HÌNH HĐ",
                industryGroup: "NHÓM NGÀNH HĐ",
                wardCommuneSpecialZone: "PHƯỜNG/ XÃ/ ĐẶC KHU",
                provinceCity: "TỈNH THÀNH",
                region: "MIỀN",
                geographicalArea: "VÙNG ĐỊA LÝ",
                customerStatus: "TRẠNG THÁI KH"
            };
            Object.keys(dropdowns).forEach(field => {

                const key = dropdowns[field];
                console.log(key, field);
                const options = config[key + "_unique"];
                const $select = $('#' + field);
                $select.empty();
                $select.append('<option value="">Chọn...</option>');
                options.forEach(option => {
                    $select.append(`<option value="${option}">${option}</option>`);
                });
            });
            $("select").selectpicker('refresh');
            STATE.initDropdowns = true;
        } catch (error) {
            console.error("Error populating dropdowns:", error);
            Swal.fire("Thông báo", "Không thể tải cấu hình khách hàng.", "error");
        }

    }

    $("#customer-modal").remove();
    $('body').append(`
            <div class="modal fade" id="customer-modal" tabindex="-1" aria-labelledby="customerModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="customerModalLabel">Thêm/Sửa Khách Hàng</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="customer-form">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="customerCode" class="form-label">MÃ KH</label>
                                        <input type="text" class="form-control" id="customerCode" name="customerCode" readonly>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="salesName" class="form-label">TÊN SALES</label>
                                        <input type="text" class="form-control" id="salesName" name="salesName" readonly>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="customerSource" class="form-label">NGUỒN KH</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="customerSource" name="customerSource"></select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="businessModel" class="form-label">MÔ HÌNH KD</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="businessModel" name="businessModel"></select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="industryGroup" class="form-label">NHÓM NGÀNH KD</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="industryGroup" name="industryGroup"></select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="customerName" class="form-label">TÊN KH</label>
                                        <input type="text" class="form-control" id="customerName" name="customerName">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="address" class="form-label">ĐỊA CHỈ</label>
                                        <input type="text" class="form-control" id="address" name="address">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="wardCommuneSpecialZone" class="form-label">PHƯỜNG/ XÃ/ ĐẶC KHU</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="wardCommuneSpecialZone" name="wardCommuneSpecialZone"></select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="provinceCity" class="form-label">TỈNH/ THÀNH</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="provinceCity" name="provinceCity"></select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="region" class="form-label">MIỀN</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="region" name="region"></select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="geographicalArea" class="form-label">VÙNG ĐỊA LÝ</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="geographicalArea" name="geographicalArea"></select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="taxCode" class="form-label">MÃ SỐ THUẾ</label>
                                        <input type="text" class="form-control" id="taxCode" name="taxCode">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="organizationPhone" class="form-label">SĐT TỔ CHỨC</label>
                                        <input type="text" class="form-control" id="organizationPhone" name="organizationPhone">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="contactPerson" class="form-label">NGƯỜI LH</label>
                                        <input type="text" class="form-control" id="contactPerson" name="contactPerson">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="mobileNumber" class="form-label">SỐ DI ĐỘNG</label>
                                        <input type="text" class="form-control" id="mobileNumber" name="mobileNumber">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="email" class="form-label">EMAIL</label>
                                        <input type="email" class="form-control" id="email" name="email">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="shippingAddress" class="form-label">ĐỊA CHỈ GIAO HÀNG</label>
                                        <input type="text" class="form-control" id="shippingAddress" name="shippingAddress">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="recipient" class="form-label">NGƯỜI NHẬN</label>
                                        <input type="text" class="form-control" id="recipient" name="recipient">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="recipientMobile" class="form-label">DI ĐỘNG</label>
                                        <input type="text" class="form-control" id="recipientMobile" name="recipientMobile">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="customerStatus" class="form-label">TRẠNG THÁI KH</label>
                                        <select data-live-search="true" class="selectpicker d-grid" id="customerStatus" name="customerStatus"></select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="accountLastModified" class="form-label">ACCOUNT/ LẦN CUỐI CHỈNH SỬA</label>
                                        <input type="text" class="form-control" id="accountLastModified" name="accountLastModified" readonly>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="customerNotes" class="form-label">GHI CHÚ VỀ KHÁCH HÀNG</label>
                                    <textarea class="form-control" id="customerNotes" name="customerNotes" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="submit" form="customer-form" class="btn btn-primary">Lưu</button>
                        </div>
                    </div>
                </div>
            </div>
        `);

    $("select").selectpicker();

    initEvents();

    // Update openCustomerModal to handle autofill and generation
    function openCustomerModal(data = {}) {
        $("select").selectpicker();
        // Populate dropdowns
        if (!STATE.initDropdowns) populateDropdowns();

        const username = localStorage.getItem('savedUsername') || '';
        if (!data.salesName) {
            setTimeout(() => {
                // Autofill salesName
                $('#salesName').val(username);
            }, 100)
        }

        // Generate customerCode if adding new
        if (data.customerCode) {
            $('#customerCode').val(data.customerCode);
        }

        // Autofill accountLastModified
        const now = new Date().toLocaleString();
        $('#accountLastModified').val(`${username} / ${now}`);

        // Populate other fields
        Object.keys(data).forEach(key => {
            let column = columns.find(x => x.field == key);
            if (column && column.input === "select") {
                $('#' + key).selectpicker('val', data[key]);
            } else {
                $('#' + key).val(data[key]);
            }
        });

        // Explicitly handle shippingAddress if needed (e.g., if it's a textarea or delayed)
        if (data.shippingAddress) {
            $('#shippingAddress').val(data.shippingAddress);
        }

        // Show modal using jQuery
        $('#customer-modal').modal('show');

        // Handle form submission
        $('#customer-form').off('submit').on('submit', async function (e) {
            showLoading();
            e.preventDefault();
            if (!validateInput()) {
                hideLoading();
                return;
            }
            const formData = new FormData(e.target);
            const customerData = Object.fromEntries(formData);
            const lastModified = [
                localStorage.getItem('savedUsername') || '',
                new Date().toLocaleString("vi-vn", { timeZone: "Asia/Ho_Chi_Minh" })
            ].join(", ");
            // const customerValues = Object.values(customerData).map(v => v || '').map(v => String(v).trim()).slice(1);
            const customerValues = [
                customerData.salesName || '',
                customerData.customerSource || '',
                customerData.businessModel || '',
                customerData.industryGroup || '',
                customerData.customerName || '',
                customerData.address || '',
                customerData.wardCommuneSpecialZone || '',
                customerData.provinceCity || '',
                customerData.taxCode || '',
                customerData.organizationPhone || '',
                customerData.contactPerson || '',
                customerData.mobileNumber || '',
                customerData.email || '',
                customerData.region || '',
                customerData.geographicalArea || '',
                customerData.shippingAddress || '',
                customerData.recipient || '',
                customerData.recipientMobile || '',
                customerData.customerNotes || '',
                customerData.customerStatus || '',
                lastModified
            ]
            try {
                let result;
                if (data.customerCode) {
                    // Edit existing
                    result = await sendRequest({
                        action: "khachhang.update",
                        id: customerData.customerCode,
                        values: customerValues
                    });
                } else {
                    result = await sendRequest({
                        action: "khachhang.create",
                        id: null,
                        values: customerValues
                    });
                }
                updateTableData(result.data);
                $('#customer-modal').modal('hide');
                hideLoading();
                Swal.fire("Thành công!", "Khách hàng đã được lưu.", "success");
            } catch (err) {
                hideLoading();
                console.error("Error saving customer:", err);
                Swal.fire("Lỗi", "Không thể lưu khách hàng. Vui lòng thử lại.", "error");
            }

        });
    }
}

// // Call the function when DOM is ready using jQuery
// $(document).ready(setupCustomers);
