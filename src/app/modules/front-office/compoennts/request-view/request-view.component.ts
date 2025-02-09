import { Component, OnInit } from '@angular/core';
import { CollectionRequest } from "../../../../models/DemandeCollecte";
import { CollectionRequestService } from "../../../../core/services/collection-request.service";
import { AuthService } from "../../../../core/services/auth.service";
import { User } from "../../../../models/User";
import { selectCurrentUser } from "../../../../store/user/user.selectors";
import { Store } from "@ngrx/store";
import { AppState } from "../../../../store/app.state";
import { RequestStatus } from '../../../../models/RequestStatus';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-view',
  templateUrl: './request-view.component.html',
  styleUrls: ['./request-view.component.scss']
})
export class RequestViewComponent implements OnInit {
  collectionRequests: CollectionRequest[] = [];
  currentUser: User | null = null;
  user$ = this.store.select(selectCurrentUser);
  constructor(
    private collectionRequestService: CollectionRequestService,
    private authService: AuthService,
    private store: Store<AppState>
    ,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadUserRequests();


  }



  loadUserRequests(): void {
    this.user$.subscribe(user => {
      this.currentUser = user;
    })

    if (this.currentUser) {
      this.collectionRequestService.getByUserId(this.currentUser.id).subscribe(requests => {
        this.collectionRequests = requests;
      })
    }

  }

  getTotalWeight(wasteItems: any[]): number {
    return wasteItems.reduce((total, item) => total + item.weight, 0);
  }

  canEdit(status: RequestStatus): boolean {
    return status == RequestStatus.PENDING
  }

  onDelete(id: string | undefined): void {
    if (!id) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this request?");

    if (confirmDelete) {
      this.collectionRequestService.deleteRequest(id).subscribe(() => {
        this.collectionRequests = this.collectionRequests.filter(e => e.id !== id);
        alert("Request deleted successfully."); // Optional success message
      }, error => {
        alert("Failed to delete request. Please try again."); // Handle errors
      });
    }
  }



}

