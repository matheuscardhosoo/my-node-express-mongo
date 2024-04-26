import AdaptersFacade from './src/adapters/facade';
import FrameworksFacade from './src/frameworks/facade';

const frameworksFacade = new FrameworksFacade();
new AdaptersFacade(frameworksFacade.expressManager);
frameworksFacade.expressManager.start();
