import Odoo from 'rn-odoo';
import AsyncStorage from '@react-native-async-storage/async-storage';

let odoo = null;

const loginOdoo = async (email, password) => {
    odoo = new Odoo({
        host: 'https://retail.seateklab.vn',
        database: 'dngretaildb',
        username: email,
        password: password,
    })
    try {
        const response = await odoo.connect();
        if (response.data) {
            const companyFind = response.data.user_companies.allowed_companies.find((p) => p[0] === response.data.company_id);
            await AsyncStorage.setItem("user_name", response.data.name);
            await AsyncStorage.setItem("user_id", JSON.stringify(response.data.user_context.uid));
            await AsyncStorage.setItem("company_name", companyFind[1]);
            return response.data;
        } else {
            throw new Error("Đăng nhập thất bại");
        }
    } catch (e) {
        throw new Error("Lỗi kết nối Odoo: " + e.message);
    }
};

const logoutOdoo = async () => {
    try {
        const response = await odoo.disconnect();
        return response.data;
    } catch (e) {
        throw new Error("Lỗi kết nối Odoo: " + e.message);
    }
};

const fetchMachines = async () => {
    const params = {
        domain: [],
        fields: ["id", "name"],
        offset: 0,
    };

    try {
        const response = await odoo.search_read('sea.vending.machine', params, {});
        return response.data || [];
    } catch (e) {
        throw new Error("Không thể lấy dữ liệu máy: " + e.message);
    }
};

const fetchSlotMachines = async () => {
    const params = {
        domain: [],
        fields: ["id", "machine_id", "slot", "product_id", "limit_quantity"],
        offset: 0,
    };

    try {
        const response = await odoo.search_read('sea.vending.machine.slots', params, {});
        return response.data || [];
    } catch (e) {
        throw new Error("Không thể lấy dữ liệu slot: " + e.message);
    }
};

const fetchTransactions = async () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const endDate = today.toISOString().slice(0, 10);
    const startDate = sevenDaysAgo.toISOString().slice(0, 10);

    const params = {
        domain: [['date', '>=', startDate], ['date', '<=', endDate],],
        fields: ["id", "machine_id", "date"],
        order: 'date DESC',
        offset: 0,
    };

    try {
        const response = await odoo.search_read('sea.vending.machine.transaction', params, {});

        return response.data || [];
    } catch (e) {
        throw new Error("Không thể lấy dữ liệu transaction: " + e.message);
    }
};

const fetchTransactionDetails = async (transaction_id) => {
    const params = {
        domain: [['transaction_id', '=', transaction_id]],
        fields: ["id", "slot", "product_id", "quantity", "quantity_actual"],
        order: 'slot ASC',
        offset: 0,
    };

    try {
        const response = await odoo.search_read('sea.vending.machine.transaction.details', params, {});

        return response.data || [];
    } catch (e) {
        throw new Error("Không thể lấy dữ liệu transaction details: " + e.message);
    }
};

const createTransaction = async (slots, images) => {
    try {
        const [storedMachine, storedUserId] = await Promise.all([
            AsyncStorage.getItem('machine_id'),
            AsyncStorage.getItem('user_id'),
        ]);

        const machine = JSON.parse(storedMachine);
        const userId = JSON.parse(storedUserId);

        if (!machine || !userId) {
            throw new Error("Không tìm thấy machine_id hoặc user_id trong AsyncStorage.");
        }

        const transactionLines = slots.filter(item => item.quantity > 0).map(item => (
            [0, 0, {
                slot: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                quantity_actual: item.quantity_actual
            }]
        ));

        const transactionImages = images.map(item => (
            [0, 0, {
                file_name: item.fileName,
                image: item.base64
            }]
        ));

        const paramTransaction = {
            machine_id: machine.id,
            user_id: userId,
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            detail_ids: transactionLines,
            image_ids: transactionImages,
        };

        const response = await odoo.create('sea.vending.machine.transaction', paramTransaction, {});

        if (!response.data) {
            throw new Error("Tạo transaction không thành công, không có dữ liệu trả về.");
        }

        return response.data;

    } catch (e) {
        throw new Error(`Không thể tạo transaction: ${e.message}`);
    }
}

export {
    loginOdoo,
    logoutOdoo,
    fetchMachines,
    fetchSlotMachines,
    createTransaction,
    fetchTransactions,
    fetchTransactionDetails
};
