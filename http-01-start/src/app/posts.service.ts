import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { Post } from "./post.model";

@Injectable({ providedIn: "root" })
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title, content };
    this.http
      .post<{ name: string }>(
        "https://ng10-complete-guide-9ac2d-default-rtdb.firebaseio.com/posts.json",
        postData,
        {
          observe: "response",
        }
      )
      .subscribe(
        (responseData) => {
          console.log(responseData);
        },
        (error) => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append("print", "pretty");
    searchParams = searchParams.append("custom", "key");
    return this.http
      .get<{ [key: string]: Post }>(
        "https://ng10-complete-guide-9ac2d-default-rtdb.firebaseio.com/posts.json",
        {
          headers: new HttpHeaders({ "Custom-Header": "Hello" }),
          params: searchParams,
          // params: new HttpParams().set("print", "pretty"),
        }
      )
      .pipe(
        map((responeseData) => {
          const postsArray: Post[] = [];
          for (const key in responeseData) {
            if (responeseData.hasOwnProperty(key)) {
              postsArray.push({ ...responeseData[key], id: key });
            }
          }
          return postsArray;
        }),
        catchError((errorResponse) => {
          // Send to analytics server
          return throwError(errorResponse);
        })
      );
  }

  deletePosts() {
    return this.http
      .delete(
        "https://ng10-complete-guide-9ac2d-default-rtdb.firebaseio.com/posts.json",
        {
          observe: "events",
          responseType: "json",
        }
      )
      .pipe(
        tap((event) => {
          console.log(event);
          if (event.type === HttpEventType.Sent) {
            // console.log(event.body);
          }
          if (event.type === HttpEventType.Response) {
            console.log(event.body);
          }
        })
      );
  }
}
