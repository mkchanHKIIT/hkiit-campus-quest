import './style.css';
import { Game3D } from './game/Game3D';
import { UIManager } from './ui/UIManager';

const ui = new UIManager();
new Game3D('game-container', ui);
