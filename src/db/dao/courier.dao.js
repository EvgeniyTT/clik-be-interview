import { Courier } from '#/sequilize/models';

class CourierDao {
    // TODO: it make sense to have all such basic operations move out to a base class.
    findById(courierId) {
        return Courier.findOne({
            where: { id: courierId },
            // ...
        });
    }
}

// TODO: This should be implemented differently (e.g. moved to IoC Container level)
const CourierDaoSingleton = new CourierDao();
export { CourierDaoSingleton as CourierDao }
