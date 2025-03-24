# form-model.js


사용자 화면에서 MVC패턴 도입을 위한 model 모듈입니다.
모델은 상태 정보를 갖고 상태 관리(예: 데이터 추가, 데이터 삭제, 데이터 변환)에 대한 책임을 갖습니다.
데이터를 변환하려면 model의 method를 통해서만 가능하기때문에 데이터의 무결성을 유지하기 유리합니다.

## 주요 기능

* append: 데이터를 한 필드에 추가합니다.
* remove: 한 필드에서 데이터 한 개를 삭제합니다.
* clearField: 한 필드의 데이터를 모두 삭제합니다.
* clearState: 모든 필드의 데이터를 삭제합니다.
* createFormElement: 필드의 데이터를 hidden input으로 변경해 HTMLFormElement로 반환합니다.

## 사용 예시

``` javascript
var controller = (model, view) => {
    return {
        addData(fieldName, val) {
            // do preprocess if needed.
            var _val = preprocess(fieldName, val);
            model.append(fieldName, val);
            // change view with new state.
            var updatedState = model.state;
            view.updateView(updatedState);
        },

        removeData(fieldName, val) {
            model.remove(fieldName, val);
            view.updateView(updatedState);
        },
        // ...
    }
}
```