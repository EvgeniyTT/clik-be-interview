import { OrderDao } from '../../db/dao/';
import { CourierService } from '../courier/courier.service';

class OrderService {
    /**
     * Returns order data
     * @param orderId
     */
    async getById(orderId) {
        // TODO: replace with `return OrderDao.findById(orderId);`
        const order = await OrderDao.findById(orderId);
        return order;
    }

    // TODO: SRP is broken. Need to split it.
    /**
     * Assign nearest available courier to order
     * @param orderId
     */
    async assignNearestCourier(orderId) {
        const order = await OrderDao.findById(orderId);

        // TODO: Use early return
        if(order) {
            // TODO: Avoid hardcoded constants. Create enum\helper to check. Best scenario -> Get rid of anemic models
            if(order.status === 'READY_TO_PICKUP') {
                const courier = await CourierService.findNearest()

                if (courier.rating < 2) {
                    // TODO: inconsistent return
                    return false;
                }

                await OrderDao.assign(orderId);

                return courier.id;
            }
            return false;
        }

        throw new NotFoundError(`No order was found with ${orderId}`);
    }

    // TODO: Review and split into smaller pieces
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

        // TODO: Memoization? Cache? Put it in db? Optimize $?
        // very $ costly request
        const integrationData = await XIntegration.fetchComplexData(constructIntegrationPath)

        // TODO:
        //  1. Retries?
        //  2. Request Queue? (in order not to reach out TOO_MANY_REQUEST)
        const dataStatusArr = [];
        for (const data of integrationData) {
            // this request takes from 5s-180s
            // this request may fail with TOO_MANY_REQUEST or INTERNAL_SERVER_ERROR
            const status = await XIntegration.fetchStatus(data);

            dataStatusArr.push(status);
        }

        return dataStatusArr;
    }
}

const OrderServiceSingleton = new OrderService();
export { OrderServiceSingleton as OrderService }
