/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@wordpress/icons/build-module/library/edit.js":
/*!********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/edit.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _pencil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pencil */ "./node_modules/@wordpress/icons/build-module/library/pencil.js");
/**
 * Internal dependencies
 */


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_pencil__WEBPACK_IMPORTED_MODULE_0__["default"]);
//# sourceMappingURL=edit.js.map

/***/ }),

/***/ "./node_modules/@wordpress/icons/build-module/library/pencil.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/pencil.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * WordPress dependencies
 */


const pencil = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, {
    d: "m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z"
  })
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pencil);
//# sourceMappingURL=pencil.js.map

/***/ }),

/***/ "./node_modules/@wordpress/icons/build-module/library/trash.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/trash.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
/**
 * WordPress dependencies
 */


const trash = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 5.5A2.25 2.25 0 0 0 9.878 7h4.244A2.251 2.251 0 0 0 12 5.5ZM12 4a3.751 3.751 0 0 0-3.675 3H5v1.5h1.27l.818 8.997a2.75 2.75 0 0 0 2.739 2.501h4.347a2.75 2.75 0 0 0 2.738-2.5L17.73 8.5H19V7h-3.325A3.751 3.751 0 0 0 12 4Zm4.224 4.5H7.776l.806 8.861a1.25 1.25 0 0 0 1.245 1.137h4.347a1.25 1.25 0 0 0 1.245-1.137l.805-8.861Z"
  })
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (trash);
//# sourceMappingURL=trash.js.map

/***/ }),

/***/ "./src/admin/App.js":
/*!**************************!*\
  !*** ./src/admin/App.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_ProcessManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/ProcessManager */ "./src/admin/components/ProcessManager.js");
/* harmony import */ var _components_ProcessTypeManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/ProcessTypeManager */ "./src/admin/components/ProcessTypeManager.js");
/* harmony import */ var _components_ProcessStepManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/ProcessStepManager */ "./src/admin/components/ProcessStepManager.js");
/* harmony import */ var _components_ProcessViewer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/ProcessViewer */ "./src/admin/components/ProcessViewer.js");
/* harmony import */ var _components_ProcessSectorManager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/ProcessSectorManager */ "./src/admin/components/ProcessSectorManager.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);







// Função para navegar para o ProcessViewer ao selecionar um processo

const navigateToProcessViewer = processId => {
  window.location.href = `?page=process-viewer&process_id=${processId}`;
};

// Adiciona um evento listener para ser executado quando o conteúdo do DOM for completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  // Obtém os elementos do DOM pelos IDs
  const processElement = document.getElementById("process-manager");
  const processTypeElement = document.getElementById("process-type-manager");
  const processStepElement = document.getElementById("process-step-manager");
  const processViewerElement = document.getElementById("process-viewer");
  const processSectorElement = document.getElementById("process-sector-manager");

  // Verifica se o elemento com o ID 'process-manager' existe
  // Se existir, renderiza o componente ProcessManager dentro deste elemento
  if (processElement) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)( /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components_ProcessManager__WEBPACK_IMPORTED_MODULE_1__["default"], {
      onSelectProcess: navigateToProcessViewer
    }), processElement);
  }

  // Verifica se o elemento com o ID 'process-type-manager' existe
  // Se existir, renderiza o componente ProcessTypeManager dentro deste elemento
  if (processTypeElement) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)( /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components_ProcessTypeManager__WEBPACK_IMPORTED_MODULE_2__["default"], {}), processTypeElement);
  }

  // Verifica se o elemento com o ID 'process-step-manager' existe
  // Se existir, renderiza o componente ProcessStepManager dentro deste elemento
  if (processStepElement) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)( /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components_ProcessStepManager__WEBPACK_IMPORTED_MODULE_3__["default"], {}), processStepElement);
  }

  // Verifica se o elemento com o ID 'process-viewer' existe
  // Se existir, renderiza o componente ProcessViewer dentro deste elemento
  if (processViewerElement) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)( /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components_ProcessViewer__WEBPACK_IMPORTED_MODULE_4__["default"], {}), processViewerElement);
  }

  // Verifica se o elemento com o ID 'process-sector-manager' existe
  // Se existir, renderiza o componente ProcessSectorManager dentro deste elemento
  if (processSectorElement) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)( /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components_ProcessSectorManager__WEBPACK_IMPORTED_MODULE_5__["default"], {}), processSectorElement);
  }
});

/***/ }),

/***/ "./src/admin/components/Modals/ConfirmDeleteModal.js":
/*!***********************************************************!*\
  !*** ./src/admin/components/Modals/ConfirmDeleteModal.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const ConfirmDeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
  itemType
}) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
  isOpen: isOpen,
  onConfirm: onConfirm,
  onCancel: onCancel,
  children: ["Tem certeza de que deseja excluir este ", itemType, "?"]
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConfirmDeleteModal);

/***/ }),

/***/ "./src/admin/components/Modals/reducer.js":
/*!************************************************!*\
  !*** ./src/admin/components/Modals/reducer.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   initialState: () => (/* binding */ initialState)
/* harmony export */ });
const initialState = {
  isOpen: false,
  deleteSector: null
};
function Reducer(state, action) {
  switch (action.type) {
    case 'OPEN_MODAL_SECTOR':
      return {
        ...state,
        isOpen: true,
        deleteSector: action.payload
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        isOpen: false,
        deleteSector: null
      };
    default:
      return state;
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Reducer);

/***/ }),

/***/ "./src/admin/components/ProcessManager.js":
/*!************************************************!*\
  !*** ./src/admin/components/ProcessManager.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




const ProcessManager = ({
  onSelectProcess
}) => {
  const [processTypes, setProcessTypes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [processes, setProcesses] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [newProcessTitle, setNewProcessTitle] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [newProcessType, setNewProcessType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [selectedProcessId, setSelectedProcessId] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // Estado para armazenar o ID do processo selecionado

  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    fetchProcessTypes();
    fetchProcesses();
  }, []);

  // Função para buscar os tipos de processo na API
  const fetchProcessTypes = () => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_type?per_page=100&_embed`
    }).then(data => {
      setProcessTypes(data);
    }).catch(error => {
      console.error('Error fetching process types:', error);
    });
  };

  // Função para buscar os processos existentes na API
  const fetchProcesses = () => {
    setIsLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_obatala?per_page=100&_embed`
    }).then(data => {
      setProcesses(data);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error fetching processes:', error);
      setIsLoading(false);
    });
  };

  // Função para criar um novo processo
  const handleCreateProcess = () => {
    if (!newProcessTitle || !newProcessType) {
      alert('Please provide a title and select a process type.');
      return;
    }
    const newProcess = {
      title: newProcessTitle,
      status: 'publish',
      type: 'process_obatala',
      process_type: newProcessType,
      current_stage: null
    };
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_obatala`,
      method: 'POST',
      data: newProcess
    }).then(savedProcess => {
      setProcesses([...processes, savedProcess]);
      setNewProcessTitle('');
      setNewProcessType('');
      // Seleciona o processo apenas quando clicado explicitamente
      // onSelectProcess(savedProcess.id);
    }).catch(error => {
      console.error('Error creating process:', error);
    });
  };

  // Função para selecionar um processo e redirecionar para o ProcessViewer
  const handleSelectProcess = processId => {
    setSelectedProcessId(processId);
    onSelectProcess(processId);
  };

  // Renderização condicional com base no estado de carregamento
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }

  // Renderiza a lista de processos ou o ProcessViewer dependendo do estado de selectedProcessId
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
      className: "brand",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
        children: "Obatala"
      }), " Curatorial Process Management"]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h2", {
      children: "Process Manager"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "panel-container",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("main", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
            title: "Existing Processes",
            initialOpen: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
              children: processes.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("table", {
                className: "wp-list-table widefat fixed striped",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("thead", {
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("tr", {
                    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("th", {
                      children: "Process Title"
                    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("th", {
                      children: "Status"
                    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("th", {
                      children: "Actions"
                    })]
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("tbody", {
                  children: processes.map(process => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("tr", {
                    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("td", {
                      children: process.title.rendered
                    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("td", {
                      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
                        className: "badge",
                        children: process.status
                      })
                    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("td", {
                      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
                        isSecondary: true,
                        onClick: () => handleSelectProcess(process.id),
                        children: "View"
                      })
                    })]
                  }, process.id))
                })]
              }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
                isDismissible: false,
                status: "warning",
                children: "No existing processes."
              })
            })
          })
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("aside", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
            title: "Create Processes",
            initialOpen: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
                label: "Process Title",
                value: newProcessTitle,
                onChange: value => setNewProcessTitle(value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
                label: "Process Type",
                value: newProcessType,
                options: [{
                  label: 'Select a process type...',
                  value: ''
                }, ...processTypes.map(type => ({
                  label: type.title.rendered,
                  value: type.id
                }))],
                onChange: value => setNewProcessType(value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
                isPrimary: true,
                onClick: handleCreateProcess,
                children: "Create Process"
              })]
            })
          })
        })
      })]
    }), selectedProcessId && onSelectProcess(selectedProcessId)]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessManager);

/***/ }),

/***/ "./src/admin/components/ProcessSectorManager.js":
/*!******************************************************!*\
  !*** ./src/admin/components/ProcessSectorManager.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Modals_reducer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Modals/reducer */ "./src/admin/components/Modals/reducer.js");
/* harmony import */ var _ProcessSectorManager_SectorCard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ProcessSectorManager/SectorCard */ "./src/admin/components/ProcessSectorManager/SectorCard.js");
/* harmony import */ var _Modals_ConfirmDeleteModal__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Modals/ConfirmDeleteModal */ "./src/admin/components/Modals/ConfirmDeleteModal.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);







const ProcessSectorManager = () => {
  const [sectors, setSectors] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [users, setUsers] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [newSectorName, setNewSectorName] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [selectedUser, setSelectedUser] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [selectedSector, setSelectedSector] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(_Modals_reducer__WEBPACK_IMPORTED_MODULE_3__["default"], _Modals_reducer__WEBPACK_IMPORTED_MODULE_3__.initialState);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    fetchSectors();
    fetchUsers();
  }, []);
  const fetchSectors = () => {
    setIsLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: '/wp/v2/sector?per_page=100&_embed'
    }).then(data => {
      setSectors(data);
      setIsLoading(false);
    }).catch(error => {
      setError(error);
      setIsLoading(false);
    });
  };
  const fetchUsers = () => {
    setIsLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: '/wp/v2/users?per_page=100&_embed'
    }).then(data => {
      setUsers(data);
      setIsLoading(false);
    }).catch(error => {
      setError(error);
      setIsLoading(false);
    });
  };
  const handleAddSector = () => {
    if (newSectorName.trim() === '') return;
    setIsLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: '/wp/v2/sector',
      method: 'POST',
      data: {
        name: newSectorName
      }
    }).then(newSector => {
      setSectors([...sectors, newSector]);
      setNewSectorName('');
      setIsLoading(false);
    }).catch(error => {
      setError(error);
      setIsLoading(false);
    });
  };
  const handleAddUserToSector = () => {
    if (selectedUser === '' || selectedSector === '') return;
    setIsLoading(true);
    const user = users.find(user => user.id === selectedUser);
    const updatedSectorIds = user.meta.sector_ids ? [...user.meta.sector_ids, selectedSector] : [selectedSector];
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/users/${selectedUser}`,
      method: 'PUT',
      data: {
        meta: {
          sector_ids: updatedSectorIds
        }
      }
    }).then(updatedUser => {
      const updatedUsers = users.map(user => user.id === updatedUser.id ? updatedUser : user);
      setUsers(updatedUsers);
      setSelectedUser('');
      setSelectedSector('');
      setIsLoading(false);
    }).catch(error => {
      setError(error);
      setIsLoading(false);
    });
  };
  const handleDeleteSector = id => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/sector/${id}?force=true`,
      method: 'DELETE'
    }).then(() => {
      setSectors(sectors.filter(sector => sector.id !== id));
    }).catch(error => {
      setError(error);
    });
  };
  const handleConfirmDeleteSector = id => {
    dispatch({
      type: 'OPEN_MODAL_SECTOR',
      payload: id
    });
  };
  const handleCancel = () => {
    dispatch({
      type: 'CLOSE_MODAL'
    });
  };
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }
  if (error) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
      status: "error",
      children: error.message
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_Modals_ConfirmDeleteModal__WEBPACK_IMPORTED_MODULE_5__["default"], {
      isOpen: state.isOpen,
      onConfirm: () => {
        if (state.deleteSector) {
          handleDeleteSector(state.deleteSector);
        }
        dispatch({
          type: 'CLOSE_MODAL'
        });
      },
      onCancel: handleCancel,
      itemType: "setor"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: "Gerenciar Setores e Usu\xE1rios",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Nome do Novo Setor",
          value: newSectorName,
          onChange: value => setNewSectorName(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isPrimary: true,
          onClick: handleAddSector,
          children: "Adicionar Setor"
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
          label: "Usu\xE1rio",
          value: selectedUser,
          options: users.map(user => ({
            label: user.name,
            value: user.id
          })),
          onChange: value => setSelectedUser(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
          label: "Setor",
          value: selectedSector,
          options: sectors.map(sector => ({
            label: sector.name,
            value: sector.id
          })),
          onChange: value => setSelectedSector(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isPrimary: true,
          onClick: handleAddUserToSector,
          children: "Adicionar Usu\xE1rio ao Setor"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: "Setores Criados",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
        className: "sectors-container",
        children: sectors.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("p", {
          children: "Nenhum setor criado."
        }) : sectors.map(sector => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_ProcessSectorManager_SectorCard__WEBPACK_IMPORTED_MODULE_4__["default"], {
          sector: sector,
          users: users.filter(user => user.meta.sector_ids && user.meta.sector_ids.includes(sector.id)),
          onDelete: handleConfirmDeleteSector
        }, sector.id))
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessSectorManager);

/***/ }),

/***/ "./src/admin/components/ProcessSectorManager/SectorCard.js":
/*!*****************************************************************!*\
  !*** ./src/admin/components/ProcessSectorManager/SectorCard.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/trash.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);




const SectorCard = ({
  sector,
  users,
  onDelete
}) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Card, {
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardHeader, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("h3", {
      children: sector.name
    })
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardBody, {
    children: users.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("p", {
      children: "Nenhum usu\xE1rio vinculado a este setor."
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("ul", {
      children: users.map(user => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("li", {
        children: [user.name, " (", user.email, ")"]
      }, user.id))
    })
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CardFooter, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Tooltip, {
      text: "Excluir Setor",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        isDestructive: true,
        icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Icon, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"]
        }),
        onClick: () => onDelete(sector.id)
      })
    })
  })]
}, sector.id);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SectorCard);

/***/ }),

/***/ "./src/admin/components/ProcessStepManager.js":
/*!****************************************************!*\
  !*** ./src/admin/components/ProcessStepManager.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




const ProcessStepManager = () => {
  const [processSteps, setProcessSteps] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [processTypes, setProcessTypes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [newStepTitle, setNewStepTitle] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [newStepType, setNewStepType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);

  // Carrega os passos de processo e tipos de processo ao inicializar
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    fetchProcessSteps();
    fetchProcessTypes();
  }, []);

  // Função para buscar os passos de processo da API WordPress
  const fetchProcessSteps = () => {
    setIsLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_step?per_page=100&_embed`
    }).then(data => {
      setProcessSteps(data);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error fetching process steps:', error);
      setIsLoading(false);
    });
  };

  // Função para buscar os tipos de processo da API WordPress
  const fetchProcessTypes = () => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_type?per_page=100&_embed`
    }).then(data => {
      setProcessTypes(data);
    }).catch(error => {
      console.error('Error fetching process types:', error);
    });
  };

  // Função para criar um novo passo de processo
  const handleCreateStep = () => {
    if (!newStepTitle || !newStepType) {
      alert('Please provide a title and select a process type.');
      return;
    }
    const newStep = {
      title: newStepTitle,
      status: 'publish',
      type: 'process_step',
      process_type: newStepType
    };
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_step`,
      method: 'POST',
      data: newStep
    }).then(savedStep => {
      setProcessSteps([...processSteps, savedStep]);
      setNewStepTitle('');
      setNewStepType('');
    }).catch(error => {
      console.error('Error creating process step:', error);
    });
  };

  // Renderiza um spinner enquanto os dados estão sendo carregados
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
      className: "brand",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
        children: "Obatala"
      }), " Curatorial Process Management"]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h2", {
      children: "Process Step Manager"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "panel-container",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("main", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
            title: "Existing Process Steps",
            initialOpen: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
              children: processSteps.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("table", {
                className: "wp-list-table widefat fixed striped",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("thead", {
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("tr", {
                    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("th", {
                      children: "Step Title"
                    })
                  })
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("tbody", {
                  children: processSteps.map(step => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("tr", {
                    className: "list-gsroup-item",
                    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("td", {
                      children: step.title.rendered
                    })
                  }, step.id))
                })]
              }) :
              /*#__PURE__*/
              // Aviso se não houver passos de processo existentes
              (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
                isDismissible: false,
                status: "warning",
                children: "No existing process steps."
              })
            })
          })
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("aside", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
            title: "Create Process Step",
            initialOpen: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
                label: "Step Title",
                value: newStepTitle,
                onChange: value => setNewStepTitle(value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
                label: "Process Type",
                value: newStepType,
                options: [{
                  label: 'Select a process type...',
                  value: ''
                }, ...processTypes.map(type => ({
                  label: type.title.rendered,
                  value: type.id
                }))],
                onChange: value => setNewStepType(value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
                isPrimary: true,
                onClick: handleCreateStep,
                children: "Create Step"
              })]
            })
          })
        })
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessStepManager);

/***/ }),

/***/ "./src/admin/components/ProcessTypeManager.js":
/*!****************************************************!*\
  !*** ./src/admin/components/ProcessTypeManager.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _ProcessTypeManager_ProcessTypeForm__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ProcessTypeManager/ProcessTypeForm */ "./src/admin/components/ProcessTypeManager/ProcessTypeForm.js");
/* harmony import */ var _ProcessTypeManager_ProcessTypeList__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ProcessTypeManager/ProcessTypeList */ "./src/admin/components/ProcessTypeManager/ProcessTypeList.js");
/* harmony import */ var _ProcessTypeManager_ProcessStepForm__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ProcessTypeManager/ProcessStepForm */ "./src/admin/components/ProcessTypeManager/ProcessStepForm.js");
/* harmony import */ var _redux_reducer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../redux/reducer */ "./src/admin/redux/reducer.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








const ProcessTypeManager = () => {
  const [processTypes, setProcessTypes] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [processSteps, setProcessSteps] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [editingProcessType, setEditingProcessType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(_redux_reducer__WEBPACK_IMPORTED_MODULE_6__["default"], _redux_reducer__WEBPACK_IMPORTED_MODULE_6__.initialState);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    fetchProcessTypes();
    fetchProcessSteps();
  }, []);
  const fetchProcessTypes = () => {
    setIsLoading(true);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_type?per_page=100&_embed`
    }).then(data => {
      console.log('Fetched Process Types:', data);
      setProcessTypes(data);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error fetching process types:', error);
      setIsLoading(false);
    });
  };
  const fetchProcessSteps = () => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_step?per_page=100&_embed`
    }).then(data => {
      console.log('Fetched Process Steps:', data);
      setProcessSteps(data);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error fetching process steps:', error);
      setIsLoading(false);
    });
  };
  const handleSaveProcessType = processType => {
    if (editingProcessType) {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/wp/v2/process_type/${editingProcessType.id}`,
        method: 'PUT',
        data: processType
      }).then(savedProcessType => {
        const updatedProcessTypes = processTypes.map(type => type.id === savedProcessType.id ? savedProcessType : type);
        setProcessTypes(updatedProcessTypes);
        setEditingProcessType(null);
      }).catch(error => {
        console.error('Error updating process type:', error);
      });
    } else {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
        path: `/wp/v2/process_type`,
        method: 'POST',
        data: processType
      }).then(savedProcessType => {
        setProcessTypes([...processTypes, savedProcessType]);
      }).catch(error => {
        console.error('Error adding process type:', error);
      });
    }
  };
  const handleDeleteProcessType = id => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_type/${id}`,
      method: 'DELETE'
    }).then(() => {
      const updatedProcessTypes = processTypes.filter(type => type.id !== id);
      setProcessTypes(updatedProcessTypes);
    }).catch(error => {
      console.error('Error deleting process type:', error);
    });
  };
  const handleEditProcessType = processType => {
    setEditingProcessType(processType);
  };
  const handleAddProcessStep = step => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_step`,
      method: 'POST',
      data: step
    }).then(savedProcessStep => {
      setProcessSteps([...processSteps, savedProcessStep]);
    }).catch(error => {
      console.error('Error adding process step:', error);
    });
  };
  const handleDeleteProcessStep = id => {
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_step/${id}`,
      method: 'DELETE'
    }).then(() => {
      const updatedProcessSteps = processSteps.filter(step => step.id !== id);
      setProcessSteps(updatedProcessSteps);
    }).catch(error => {
      console.error('Error deleting process step:', error);
    });
  };
  const handleConfirmDeleteType = id => {
    dispatch({
      type: 'OPEN_MODAL_PROCESS_TYPE',
      payload: id
    });
  };
  const handleConfirmDeleteStep = id => {
    dispatch({
      type: 'OPEN_MODAL_STEP',
      payload: id
    });
  };
  const handleCancel = () => {
    dispatch({
      type: 'CLOSE_MODAL'
    });
  };
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {});
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("span", {
      class: "brand",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("strong", {
        children: "Obatala"
      }), " Curatorial Process Management"]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("h2", {
      children: "Process Type Manager"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "panel-container",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("main", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.__experimentalConfirmDialog, {
          isOpen: state.isOpen,
          onConfirm: () => {
            if (state.deleteProcessType) {
              handleDeleteProcessType(state.deleteProcessType);
            } else if (state.deleteStep) {
              handleDeleteProcessStep(state.deleteStep);
            }
            dispatch({
              type: 'CLOSE_MODAL'
            });
          },
          onCancel: handleCancel,
          children: ["Are you sure you want to delete this ", state.deleteProcessType ? 'Process Type' : 'Step', "?"]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ProcessTypeManager_ProcessTypeList__WEBPACK_IMPORTED_MODULE_4__["default"], {
          processTypes: processTypes,
          processSteps: processSteps,
          onEdit: handleEditProcessType,
          onDelete: handleConfirmDeleteType,
          onDeleteStep: handleConfirmDeleteStep
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("aside", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ProcessTypeManager_ProcessTypeForm__WEBPACK_IMPORTED_MODULE_3__["default"], {
          onSave: handleSaveProcessType,
          onCancel: () => setEditingProcessType(null),
          editingProcessType: editingProcessType
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ProcessTypeManager_ProcessStepForm__WEBPACK_IMPORTED_MODULE_5__["default"], {
          processTypes: processTypes,
          onAddStep: handleAddProcessStep
        })]
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessTypeManager);

/***/ }),

/***/ "./src/admin/components/ProcessTypeManager/ProcessStepForm.js":
/*!********************************************************************!*\
  !*** ./src/admin/components/ProcessTypeManager/ProcessStepForm.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const ProcessStepForm = ({
  processTypes,
  onAddStep
}) => {
  const [selectedProcessType, setSelectedProcessType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [stepName, setStepName] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [selectedProcess, setSelectedProcess] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const handleAddStep = () => {
    if (!selectedProcessType || !selectedProcess) {
      alert('Please select both a process type and a parent process.');
      return;
    }
    const newStep = {
      title: stepName,
      status: 'publish',
      process_type: selectedProcessType,
      parent_process: selectedProcess
    };
    onAddStep(newStep);
    setStepName('');
    setSelectedProcessType('');
    setSelectedProcess('');
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: "Add Process Step",
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Step Name",
          value: stepName,
          onChange: value => setStepName(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
          label: "Select Process Type",
          value: selectedProcessType,
          options: [{
            label: 'Select a process type...',
            value: ''
          }, ...processTypes.map(type => ({
            label: type.title.rendered,
            value: type.id
          }))],
          onChange: value => setSelectedProcessType(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
          label: "Select Parent Process",
          value: selectedProcess,
          options: [{
            label: 'Select a parent process...',
            value: ''
          }, ...processTypes.map(type => ({
            label: type.title.rendered,
            value: type.id
          }))],
          onChange: value => setSelectedProcess(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isSecondary: true,
          onClick: handleAddStep,
          children: "Add Process Step"
        })]
      })
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessStepForm);

/***/ }),

/***/ "./src/admin/components/ProcessTypeManager/ProcessTypeForm.js":
/*!********************************************************************!*\
  !*** ./src/admin/components/ProcessTypeManager/ProcessTypeForm.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



const ProcessTypeForm = ({
  onSave,
  onCancel,
  editingProcessType
}) => {
  const [processTypeName, setProcessTypeName] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [processTypeDescription, setProcessTypeDescription] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [acceptAttachments, setAcceptAttachments] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [acceptTainacanItems, setAcceptTainacanItems] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [generateTainacanItems, setGenerateTainacanItems] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (editingProcessType) {
      var _editingProcessType$a, _editingProcessType$a2, _editingProcessType$g;
      setProcessTypeName(editingProcessType.title.rendered);
      setProcessTypeDescription(editingProcessType.description || '');
      setAcceptAttachments((_editingProcessType$a = editingProcessType.accept_attachments) !== null && _editingProcessType$a !== void 0 ? _editingProcessType$a : false);
      setAcceptTainacanItems((_editingProcessType$a2 = editingProcessType.accept_tainacan_items) !== null && _editingProcessType$a2 !== void 0 ? _editingProcessType$a2 : false);
      setGenerateTainacanItems((_editingProcessType$g = editingProcessType.generate_tainacan_items) !== null && _editingProcessType$g !== void 0 ? _editingProcessType$g : false);
    }
  }, [editingProcessType]);
  const handleSave = () => {
    const processType = {
      status: 'publish',
      title: processTypeName,
      description: processTypeDescription,
      accept_attachments: acceptAttachments,
      accept_tainacan_items: acceptTainacanItems,
      generate_tainacan_items: generateTainacanItems
    };
    onSave(processType);
  };
  const handleCancel = () => {
    onCancel();
    setProcessTypeName('');
    setProcessTypeDescription('');
    setAcceptAttachments(false);
    setAcceptTainacanItems(false);
    setGenerateTainacanItems(false);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
      title: "Add Process Type",
      initialOpen: true,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Process Type Name",
          value: processTypeName,
          onChange: value => setProcessTypeName(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Process Type Description",
          value: processTypeDescription,
          onChange: value => setProcessTypeDescription(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
          label: "Accept Attachments",
          checked: acceptAttachments,
          onChange: value => setAcceptAttachments(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
          label: "Accept Tainacan Items",
          checked: acceptTainacanItems,
          onChange: value => setAcceptTainacanItems(value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
          label: "Generate Tainacan Items",
          checked: generateTainacanItems,
          onChange: value => setGenerateTainacanItems(value)
        }), editingProcessType ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            isPrimary: true,
            onClick: handleSave,
            children: "Update Process Type"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            onClick: handleCancel,
            children: "Cancel"
          })]
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isPrimary: true,
          onClick: handleSave,
          children: "Add Process Type"
        })]
      })
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessTypeForm);

/***/ }),

/***/ "./src/admin/components/ProcessTypeManager/ProcessTypeList.js":
/*!********************************************************************!*\
  !*** ./src/admin/components/ProcessTypeManager/ProcessTypeList.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/trash.js");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/edit.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);



const ProcessTypeList = ({
  processTypes,
  processSteps,
  onEdit,
  onDelete,
  onDeleteStep
}) => (console.log(processTypes, processSteps), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Panel, {
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelBody, {
    title: "Existing Process Types",
    initialOpen: true,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.PanelRow, {
      children: processTypes.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", {
        className: "card-container",
        children: processTypes.map(type => {
          const steps = processSteps.filter(step => +step.process_type === type.id);
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Card, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CardHeader, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("h4", {
                className: "card-title",
                children: type.title.rendered
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CardBody, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("dl", {
                className: "description-list",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div", {
                  className: "list-item",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("dt", {
                    children: "Description:"
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("dd", {
                    children: type.description ? type.description : "-"
                  })]
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("p", {
                className: type.accept_attachments ? "check true" : "check false",
                children: [!type.accept_attachments && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span", {
                  className: "visually-hidden",
                  children: "Not"
                }), " Accept attachments"]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("p", {
                className: type.accept_tainacan_items ? "check true" : "check false",
                children: [!type.accept_tainacan_items && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span", {
                  className: "visually-hidden",
                  children: "Not"
                }), " Accept Tainacan items"]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("p", {
                className: type.generate_tainacan_items ? "check true" : "check false",
                children: [!type.generate_tainacan_items && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span", {
                  className: "visually-hidden",
                  children: "Not"
                }), " Generate Tainacan items"]
              }), steps.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("hr", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("h5", {
                  children: "Steps"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("ul", {
                  className: "list-group",
                  children: steps.map(step => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("li", {
                    className: "list-group-item",
                    children: [step.title.rendered, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Tooltip, {
                      text: "Delete Step",
                      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
                        isDestructive: true,
                        icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
                          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__["default"]
                        }),
                        onClick: () => onDeleteStep(step.id)
                      })
                    })]
                  }, step.id))
                })]
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.CardFooter, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Tooltip, {
                text: "Edit",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
                  icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
                    icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"]
                  }),
                  onClick: () => onEdit(type)
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Tooltip, {
                text: "Delete",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
                  icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
                    icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__["default"]
                  }),
                  onClick: () => onDelete(type.id)
                })
              })]
            })]
          }, type.id);
        })
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Notice, {
        isDismissible: false,
        status: "warning",
        children: "No existing processes types."
      })
    })
  })
}));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessTypeList);

/***/ }),

/***/ "./src/admin/components/ProcessViewer.js":
/*!***********************************************!*\
  !*** ./src/admin/components/ProcessViewer.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




const ProcessViewer = () => {
  // Estados para armazenar o processo, estado de carregamento e erros
  const [process, setProcess] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // Armazena os dados do processo
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true); // Estado para indicar se está carregando
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // Armazena mensagens de erro

  // Função para obter o ID do processo da URL atual
  const getProcessIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('process_id');
  };

  // Efeito para carregar o processo ao montar o componente
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const processId = getProcessIdFromUrl();
    if (processId) {
      fetchProcess(processId); // Se houver ID de processo na URL, busca o processo
    } else {
      setError('No process ID found in the URL.'); // Se não houver ID, define erro
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  }, []);

  // Função para buscar os detalhes do processo na API
  const fetchProcess = processId => {
    setIsLoading(true); // Indica que está carregando
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
      path: `/wp/v2/process_obatala/${processId}?_embed`
    }).then(data => {
      setProcess(data); // Define os dados do processo no estado
      setIsLoading(false); // Finaliza o estado de carregamento
    }).catch(error => {
      console.error('Error fetching process:', error); // Registra erro no console
      setError('Error fetching process details.'); // Define mensagem de erro
      setIsLoading(false); // Finaliza o estado de carregamento
    });
  };

  // Renderização condicional com base nos estados de carregamento e erro
  if (isLoading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}); // Exibe spinner enquanto está carregando
  }
  if (error) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
      status: "error",
      isDismissible: false,
      children: error
    }); // Exibe mensagem de erro se houver
  }
  if (!process) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
      status: "warning",
      isDismissible: false,
      children: "No process found."
    }); // Exibe aviso se não houver processo
  }

  // Renderiza os detalhes do processo
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
      className: "brand",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
        children: "Obatala"
      }), " Curatorial Process Viewer"]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("h2", {
      children: ["Process: ", process.title.rendered]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
      className: "badge",
      children: process.status
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "panel-container",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("main", {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Panel, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
            title: "Process details",
            initialOpen: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelRow, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("dl", {
                className: "description-list",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
                  className: "list-item",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("dt", {
                    children: "Process Type:"
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("dd", {
                    children: process.process_type
                  })]
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
                  className: "list-item",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("dt", {
                    children: "Current Stage:"
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("dd", {
                    children: process.current_stage
                  })]
                })]
              })
            })
          })
        })
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProcessViewer);

/***/ }),

/***/ "./src/admin/redux/reducer.js":
/*!************************************!*\
  !*** ./src/admin/redux/reducer.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   initialState: () => (/* binding */ initialState)
/* harmony export */ });
const initialState = {
  isOpen: false,
  deleteProcessType: null,
  deleteStep: null
};
function Reducer(state = initialState, action) {
  switch (action.type) {
    case 'OPEN_MODAL_PROCESS_TYPE':
      return {
        ...state,
        isOpen: true,
        deleteProcessType: action.payload
      };
    case 'OPEN_MODAL_STEP':
      return {
        ...state,
        isOpen: true,
        deleteStep: action.payload
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        isOpen: false,
        deleteProcessType: null,
        deleteStep: null
      };
    default:
      return state;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Reducer);

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/primitives":
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["primitives"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _admin_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./admin/App */ "./src/admin/App.js");

/******/ })()
;
//# sourceMappingURL=index.js.map