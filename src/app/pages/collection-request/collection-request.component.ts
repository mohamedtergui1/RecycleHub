import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { CollectionRequest, WasteType, RequestStatus, WasteItem } from '../../model/CollectionRequest';

@Component({
    selector: 'app-collection-request',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, TagModule, ButtonModule],
    templateUrl: 'collection-request.component.html'
})
export class CollectionRequestComponent {
    readonly defaultImage: string = 'https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg';
    collectionRequests: CollectionRequest[] = [
        {
            id: 'CR001',
            userId: 'USER123',
            collectorId: 'COL456',
            status: RequestStatus.InProgress,
            wastes: [
                {
                    type: WasteType.Plastic,
                    kilos: 15.2,
                    image: ''
                },
                {
                    type: WasteType.Glass,
                    kilos: 8.8,
                    image: ''
                }
            ],
            address: {
                street: '123 Green Street',
                city: 'Portland'
            },
            date: new Date('2025-02-15'),
            timeSlot: '09:00-12:00',
            notes: 'Please ring doorbell twice'
        }
    ];

    layout: 'list' | 'grid' = 'list';

    options = ['list', 'grid'];

    sourceCities: any[] = [];

    targetCities: any[] = [];

    orderCities: any[] = [];

    constructor() {}

    ngOnInit() {

    }

    getStatusSeverity(request: CollectionRequest): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        switch (request.status) {
            case RequestStatus.Pending:
                return 'warn';
            case RequestStatus.Accepted:
                return 'success';
            case RequestStatus.InProgress:
                return 'info';
            case RequestStatus.Completed:
                return 'secondary';
            case RequestStatus.Rejected:
                return 'danger';
            default:
                return 'info';
        }
    }

    getTotalKilos(wastes: WasteItem[]): number {
        return wastes.reduce((sum, waste) => sum + waste.kilos, 0);
    }

    formatAddress(address: any): string {
        return `${address.street}, ${address.city}, ${address.postalCode}`;
    }

    formatWasteTypes(wasteTypes: WasteType[]): string {
        return wasteTypes.map((type) => WasteType[type]).join(', ');
    }

    // Keep your existing sampleCollectionRequests array here
}
