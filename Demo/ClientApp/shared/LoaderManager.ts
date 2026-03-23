export class LoaderManager {
    private static instance: LoaderManager;
    private loader: HTMLElement | null;
    private activeRequests: number = 0; // Compteur pour gérer les appels simultanés

    private constructor() {
        this.loader = document.getElementById('app-loader');
    }

    public static getInstance(): LoaderManager {
        if (!LoaderManager.instance) {
            LoaderManager.instance = new LoaderManager();
        }
        return LoaderManager.instance;
    }

    /**
     * Affiche le loader. 
     * Utilise un compteur pour éviter qu'un composant cache le loader 
     * alors qu'un autre en a encore besoin.
     */
    public show(): void {
        this.activeRequests++;
        if (this.loader) {
            this.loader.classList.remove('spinner-hidden');
        }
    }

    /**
     * Cache le loader avec un léger délai pour éviter les flashs visuels.
     */
    public hide(force: boolean = false): void {
        if (force) this.activeRequests = 0;
        else this.activeRequests--;

        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            setTimeout(() => {
                if (this.activeRequests === 0) {
                    this.loader?.classList.add('spinner-hidden');
                }
            }, 200);
        }
    }

    /**
     * Méthode de test simplifiée
     */
    public test(duration: number = 3000): void {
        this.show();
        setTimeout(() => this.hide(), duration);
    }
}