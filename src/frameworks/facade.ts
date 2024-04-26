import ExpressManager from './express';
import MongooseManager from './mongoose';

class FrameworksFacade {
    public expressManager: ExpressManager;

    public mongooseManager: MongooseManager;

    constructor() {
        this.mongooseManager = new MongooseManager();
        this.expressManager = new ExpressManager(this.mongooseManager);
    }
}

export default FrameworksFacade;
