// utility.js

function createTableControls(table, addHandler=null, editHandler=null, deleteHandler=null) {
    const tableID = table.element.id;
    // Create the main container
    const container = $('<div class="d-flex justify-content-between align-items-center mb-3"></div>');
    
    // Left side: Buttons
    const buttonGroup = $('<div class="btn-group"></div>');
    
    const addBtn = $('<button class="btn btn-success" id="addBtn"><i class="bi bi-plus"></i> Thêm</button>');
    const editBtn = $('<button class="btn btn-primary" id="editBtn" disabled><i class="bi bi-pencil"></i> Sửa</button>');
    const deleteBtn = $('<button class="btn btn-danger" id="deleteBtn" disabled><i class="bi bi-trash"></i> Xóa</button>');
    
    buttonGroup.append(addBtn, editBtn, deleteBtn);
    
    // Right side: Search bar
    const searchGroup = $('<div class="input-group" style="width: 300px;"></div>');
    const searchInput = $('<input type="text" class="form-control" placeholder="Tìm kiếm..." id="globalSearch">');
    const searchBtn = $('<button class="btn btn-outline-secondary" type="button"><i class="bi bi-search"></i></button>');
    
    searchGroup.append(searchInput, searchBtn);
    
    // Append to container
    container.append(buttonGroup, searchGroup);
    
    // Attach to body or a specific element (assuming #tableContainer exists)
    $("#table-title").after(container);

    console.log(tableID);
    console.log(container);
    
    // Tabulator integration
    // Global search
    searchInput.on('input', function() {
        table.setFilter('global', 'like', $(this).val());
    });
    
    // Row selection handling
    table.on('rowSelectionChanged', function(data, rows) {
        const selectedRows = table.getSelectedRows();
        if (selectedRows.length > 0) {
            editBtn.prop('disabled', false);
            deleteBtn.prop('disabled', false);
        } else {
            editBtn.prop('disabled', true);
            deleteBtn.prop('disabled', true);
        }
    });
    
    // Button event handlers (placeholders - implement as needed)
    addBtn.on('click', function() {
        // Implement add functionality
        console.log('Add clicked');
        if (addHandler) addHandler();
    });
    
    editBtn.on('click', function() {
        // Implement edit functionality
        console.log('Edit clicked');
        if (editHandler) editHandler();
    });
    
    deleteBtn.on('click', function() {
        // Implement delete functionality
        console.log('Delete clicked');
        if (deleteHandler) deleteHandler();
    });
}

function arrayToObjects(arr) {
    if (arr.length === 0) return [];
    const keys = arr[0];
    return arr.slice(1).map(row => {
        const obj = {};
        keys.forEach((key, index) => {
            let keyClean = key.replace(/[*"()]/g, '').trim();
            obj[keyClean] = row[index];
        });
        return obj;
    });
}

function arrayToConfig(arr) {
    if (arr.length === 0) return {};
    const keys = arr[0];
    const config = {};
    keys.forEach((key, index) => {
        let keyClean = key.replace(/[*"()]/g, '').trim();
        config[keyClean] = arr.slice(1).map(row => row[index]).filter(x => x);
        config[keyClean+"_unique"] = [...new Set(config[keyClean])];    
    });
    // console.log(config);
    return config;
}

