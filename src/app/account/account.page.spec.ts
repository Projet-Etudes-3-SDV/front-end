import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AccountPage } from './account.page';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture: ComponentFixture<AccountPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AccountPage],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      providers: [AuthService, ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a user object', () => {
    component.user = {
      id: 'test-id',
      lastName: 'Doe',
      firstName: 'John',
      email: 'john.doe@example.com',
      cart: { id: 'cart-id', products: [] },
      subscriptions: [],
      addresses: []
    };
    fixture.detectChanges();
    expect(component.user.firstName).toEqual('John');
  });
});
