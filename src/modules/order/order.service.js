import { OrderDao } from '../../db/dao/';
import { CourierService } from '../courier/courier.service';

const INTEGRATION_STATUS_RETRY = 5;

class OrderService {

    constructor(dbService) {
        this.dbService = dbService;
    }
    /**
     * Returns order data
     * @param orderId
     */
    async getById(orderId) {
        return dbService.findById(orderId);
    }

    /**
     * Assign nearest available courier to order
     * @param orderId
     */
    // inconsistent return
    // would be better to return courier object, not just ID
    // mixed logic and CourierService call
    async assignNearestCourier(orderId) {
        const order = await dbService.findById(orderId);

        if(order) {
            if(order.status === 'READY_TO_PICKUP') {
                const courier = await CourierService.findNearest()

                // magic number
                if (courier.rating < 2) {
                    return false;
                }

                await dbService.assign(orderId);

                return courier.id;
            }
            return false;
        }

        throw new NotFoundError(`No order was found with ${orderId}`);
    }

    // ...
    // + 500 lines of business logic
    // ...

    /**
     * Check integration status
     * NOTE: 1st request is very costly for our business, 2nd could take more than 2 minutes to fetch results and sometimes fails.
     * @example http://x.integration/customers-path/int/5919232/path/?access_token=47166EF3DA46657EC194C9A822737BDE45D37852BC7F2B67C9A7824685
     * @param orderId
     */
    async checkIntegrationStatus(orderId) {
        const constructIntegrationPath = `int/${orderId}/path`;

        // very $ costly request
        // if possible would be nice to cache it or store in our DB, and check it there at first
        let integrationData = await this.getIntergrationData(orderId);
        if(!integrationData) {
            integrationData = await XIntegration.fetchComplexData(constructIntegrationPath)
            await this.saveIntergrationData(orderId, integrationData);
        }

        const dataStatusArr = [];
        // for (const data of integrationData) {
        //     // this request takes from 5s-180s
        //     // this request may fail with TOO_MANY_REQUEST or INTERNAL_SERVER_ERROR
        //     const status = await XIntegration.fetchStatus(data);

        //     dataStatusArr.push(status);
        // }

        // can be moved to a config
        const retryCount = process.env.INTEGRATION_STATUS_RETRY || INTEGRATION_STATUS_RETRY;
        // solutions depends on multiple factors:
        // - how many requests we expect to have
        // - what the expected reqest limit of this API
        // - what the error flow, do we need to have all succeded responses or we can proceed with partial data
        // - how we're going to handle errors
        // - etc.
        for (let i = 0; i < retryCount && integrationData.length; i++) {
            await Promise
                .allSettled(integrationData.map(data => XIntegration.fetchStatus(data)))
                .then(responseObjs => {
                    dataStatusArr = [
                        ...dataStatusArr,
                        ...responseObjs.filter(res => res.status === 'fulfilled').map(res => res.value),
                    ];
                    integrationData = responseObjs.filter(res => res.status === 'rejected')
                })
        }

        if (integrationData.length) {
            // log rejected / throw erros
        }

        return dataStatusArr;
    }
}

const OrderServiceSingleton = new OrderService(OrderDao);
export { OrderServiceSingleton as OrderService }
