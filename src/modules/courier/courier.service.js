import { OrderDao } from '../../db/dao/';
import { CourierDao } from '../../db/dao/courier.dao';

// import { OrderService } from '../order/order.service'; // can't import it now?

class CourierService {

    constructor(dbService) {
        this.dbService = dbService;
    }

    /**
     * Returns courier data
     * @param courierId
     */
    async getCurrentOrderByCourierId(courierId) {
        const courier = this.dbService.findById(courierId);

        // some dummy check
        // better to use const / enum for comparison
        if(courier.status === 'BLOCKED') {
            throw new ForbiddenError('Courier is blocked now.');
        }

        // let's get and return order (service-to-service communication?).
        return await OrderDao.findById(courierId);
    }

    // ...
    // + 500 lines of business logic
    // ...

    /**
     * @param courierId
     * @param buffer
     */
    async uploadPhotoToS3(courierId, buffer) {
        await S3Service.putObjectToBucket(`couriers/${courierId}`, 'some-unique-name.png', buffer);
    }
}

const CourierServiceSingleton = new CourierService(CourierDao);
export { CourierServiceSingleton as CourierService }
