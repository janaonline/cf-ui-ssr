import { Subject } from 'rxjs';

export class Login_Logout {
  private static logoutEvent = new Subject<{
    redirectLink?: string | undefined;
  }>();

  static getListenToLogoutEvent() {
    return Login_Logout.logoutEvent;
  }

  public static logout(option?: any) {
    Login_Logout.logoutEvent.next(option);
  }
}
