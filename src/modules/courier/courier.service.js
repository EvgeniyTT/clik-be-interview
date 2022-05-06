import { OrderDao } from '../../db/dao/';
import { CourierDao } from '../../db/dao/courier.dao';

// TODO: U can not import it due to a cyclic dependency
// import { OrderService } from '../order/order.service'; // can't import it now?

class CourierService {

    // TODO: SRP is not followed here. We need to move out validation logic out of here.
    /**
     * Returns courier data
     * @param courierId
     */
    async getCurrentOrderByCourierId(courierId) {
        const courier = CourierDao.findById(courierId);

        // some dummy check
        if(courier.status === 'BLOCKED') {
            throw new ForbiddenError('Courier is blocked now.');
        }

        // TODO:
        //  1. Rename to OrderDao.findByCourierId
        //  2. remove await
        // let's get and return order (service-to-service communication?).
        return await OrderDao.findById(courierId);
    }

    // TODO: Review and split the service into smaller pieces
    // ...
    // + 500 lines of business logic
    // ...

    /**
     * @param courierId
     * @param buffer
     */
    async uploadPhotoToS3(courierId, buffer) {
        await S3Service.putObjectToBucket('some/folder', 'some-unique-name.png', buffer);
    }
}

const CourierServiceSingleton = new CourierService();
export { CourierServiceSingleton as CourierService }
