import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { CollectionRequest } from '../../../../models/DemandeCollecte';
import { CollectionRequestService } from '../../../../core/services/collection-request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestStatus } from '../../../../models/RequestStatus';
import { WasteType } from '../../../../models/WasteType';
import { User } from '../../../../models/User';
@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.component.html'
})
export class EditRequestComponent implements OnInit {
  currentUser: User | null = null;
  requestForm!: FormGroup;
  requestId!: string; // Store the request ID from the route
  wasteTypeValues = Object.values(WasteType);
  wasteTypeLabels: { [key in WasteType]: string } = {
    [WasteType.PLASTIC]: 'PLASTIC',
    [WasteType.GLASS]: 'GLASS',
    [WasteType.PAPER]: 'PAPER',
    [WasteType.METAL]: 'METAL'
  };
  timeSlots = ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00'];
  selectedFiles: File[] | undefined = [];
  maxTotalWeight = 10;
  currentRequest!: CollectionRequest; // Store the fetched request

  constructor(
    private fb: FormBuilder,
    private collectionRequestService: CollectionRequestService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Get the request ID from the route
    this.requestId = this.route.snapshot.paramMap.get('id')!;
    
    if (this.requestId) {
      this.loadRequestData(this.requestId);
    }

    this.authService.getUserDetails().subscribe((user) => {
      this.currentUser = user;
    });
  }

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      wasteItems: this.fb.array([], [this.uniqueWasteTypeValidator]),
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      preferredDate: ['', Validators.required],
      preferredTimeSlot: ['', Validators.required],
      additionalNotes: [''],
      photos: [[]]
    });
  }

  private loadRequestData(requestId: string): void {
    this.collectionRequestService.getById(requestId).subscribe((request) => {
      this.currentRequest = request;
      this.populateForm(request);
    });
  }

  private populateForm(request: CollectionRequest): void {
    this.requestForm.patchValue({
      streetAddress: request.address.street,
      city: request.address.city,
      postalCode: request.address.postalCode,
      preferredDate: request.preferredDate,
      preferredTimeSlot: request.preferredTimeSlot,
      additionalNotes: request.additionalNotes
    });

    // Populate waste items
    const wasteItemsFormArray = this.requestForm.get('wasteItems') as FormArray;
    request.wasteItems.forEach(item => {
      wasteItemsFormArray.push(this.fb.group({
        type: [item.type, Validators.required],
        weight: [item.weight, [
          Validators.required,
          Validators.min(1),
          Validators.max(this.maxTotalWeight)
        ]]
      }));
    });

    // Store the existing photos
    this.selectedFiles = request?.photos?.map(name => new File([], name));
  }

  get wasteItemsControls() {
    return (this.requestForm.get('wasteItems') as FormArray).controls;
  }

  addWasteItem(): void {
    const wasteItemForm = this.fb.group({
      type: ['', Validators.required],
      weight: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.maxTotalWeight)
      ]]
    });

    (this.requestForm.get('wasteItems') as FormArray).push(wasteItemForm);
  }

  removeWasteItem(index: number): void {
    (this.requestForm.get('wasteItems') as FormArray).removeAt(index);
  }

  private uniqueWasteTypeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const wasteItems = control as FormArray;
    const types = wasteItems.controls.map(item => item.get('type')?.value);
    const hasDuplicates = new Set(types).size !== types.length;
    return hasDuplicates ? { duplicateWasteType: true } : null;
  }

  getTotalWeight(): number {
    const wasteItems = this.requestForm.get('wasteItems') as FormArray;
    return wasteItems.controls.reduce(
      (sum, control) => sum + (control.get('weight')?.value || 0), 0
    );
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit(): void {
    if (this.requestForm.valid && this.validateTotalWeight()) {
      const updatedRequest: CollectionRequest = this.createUpdatedRequest();
      this.collectionRequestService.updateRequest(this.requestId, updatedRequest).subscribe({
        next: () => this.handleUpdateSuccess(),
        error: () => this.handleUpdateError()
      });
    } else {
      this.requestForm.markAllAsTouched();
    }
  }

  private validateTotalWeight(): boolean {
    const totalWeight = this.getTotalWeight();
    return totalWeight > 0 && totalWeight <= this.maxTotalWeight;
  }

  private createUpdatedRequest(): CollectionRequest {
    const wasteItems = (this.requestForm.get('wasteItems') as FormArray).controls.map(control => ({
      type: control.get('type')?.value ?? '',
      weight: control.get('weight')?.value ?? 0,
      points: this.calculatePoints(
        control.get('type')?.value ?? '',
        control.get('weight')?.value ?? 0
      )
    }));

    return {
      ...this.currentRequest,
      wasteItems,
      photos: this.selectedFiles?.map((file) => file.name),
      address: {
        street: this.requestForm.value.streetAddress,
        city: this.requestForm.value.city,
        postalCode: this.requestForm.value.postalCode
      },
      preferredDate: this.requestForm.value.preferredDate,
      preferredTimeSlot: this.requestForm.value.preferredTimeSlot,
      additionalNotes: this.requestForm.value.additionalNotes || '',
      status: RequestStatus.PENDING
    };
  }

  private calculatePoints(type: WasteType, weight: number): number {
    const pointsMap = {
      [WasteType.PLASTIC]: 2,
      [WasteType.GLASS]: 1,
      [WasteType.PAPER]: 1,
      [WasteType.METAL]: 5
    };
    return Math.round(weight * pointsMap[type]);
  }

  private handleUpdateSuccess(): void {
    this.router.navigate(['/request/view']);
  }

  private handleUpdateError(): void {
    alert('Error updating the request. Please try again.');
  }
  isWasteTypeSelected(type:WasteType):boolean{
    return false
  }
}
