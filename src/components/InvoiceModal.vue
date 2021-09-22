<template>
  <div
      @click="checkClick"
      class="invoice-wrap flex flex-column"
      ref="invoiceWrap"
  >
    <form class="invoice-content" @submit.prevent="submitForm">
      <loading v-show="loading"/>
      <h1 v-if="!editInvoice">New Invoice</h1>
      <h1 v-else>Edit Invoice</h1>
      <!-- Bill From -->
      <div class="bill-from flex flex-column">
        <h4>Bill From</h4>
        <div class="input flex flex-column">
          <label for="billerStreetAddress">Street Address</label>
          <input
              required
              type="text"
              id="billerStreetAddress"
              v-model="billerStreetAddress"
          />
        </div>
        <div class="location-details flex">
          <div class="input flex flex-column">
            <label for="billerCity">City</label>
            <input required type="text" id="billerCity" v-model="billerCity"/>
          </div>
          <div class="input flex flex-column">
            <label for="billerZipCode">Zip Code</label>
            <input
                required
                type="text"
                id="billerZipCode"
                v-model="billerZipCode"
            />
          </div>
          <div class="input flex flex-column">
            <label for="billerCountry">Country</label>
            <input
                required
                type="text"
                id="billerCountry"
                v-model="billerCountry"
            />
          </div>
        </div>
      </div>
      <!-- Bill To -->
      <div class="bill-to flex flex-column">
        <h4>Bill To</h4>
        <div class="input flex flex-column">
          <label for="clientName">Client's Name</label>
          <input required type="text" id="clientName" v-model="clientName"/>
        </div>
        <div class="input flex flex-column">
          <label for="clientEmail">Client's Email</label>
          <input required type="text" id="clientEmail" v-model="clientEmail"/>
        </div>
        <div class="input flex flex-column">
          <label for="clientStreetAddress">Street Address</label>
          <input
              required
              type="text"
              id="clientStreetAddress"
              v-model="clientStreetAddress"
          />
        </div>
        <div class="location-details flex">
          <div class="input flex flex-column">
            <label for="clientCity">City</label>
            <input required type="text" id="clientCity" v-model="clientCity"/>
          </div>
          <div class="input flex flex-column">
            <label for="clientZipCode">Zip Code</label>
            <input
                required
                type="text"
                id="clientZipCode"
                v-model="clientZipCode"
            />
          </div>
          <div class="input flex flex-column">
            <label for="clientCountry">Country</label>
            <input
                required
                type="text"
                id="clientCountry"
                v-model="clientCountry"
            />
          </div>
        </div>
      </div>

      <!-- Invoice Work Details -->
      <div class="invoice-work flex flex-column">
        <div class="payment flex">
          <div class="input flex flex-column">
            <label for="invoiceDate">Invoice Date</label>
            <input
                disabled
                type="text"
                id="invoiceDate"
                v-model="invoiceDate"
            />
          </div>
          <div class="input flex flex-column">
            <label for="paymentDueDate">Payment Due</label>
            <input
                disabled
                type="text"
                id="paymentDueDate"
                v-model="paymentDueDate"
            />
          </div>
        </div>
        <div class="input flex flex-column">
          <label for="paymentTerms">Payment Terms</label>
          <select required id="paymentTerms" v-model="paymentTerms">
            <option value="30">Net 30 Days</option>
            <option value="60">Net 60 Days</option>
          </select>
        </div>
        <div class="input flex flex-column">
          <label for="productDescription">Product Description</label>
          <input
              required
              type="text"
              id="productDescription"
              v-model="productDescription"
          />
        </div>
        <div class="work-items">
          <h3>Item List</h3>
          <table class="item-list">
            <tr class="table-heading flex">
              <th class="item-name">Item Name</th>
              <th class="qty">Qty</th>
              <th class="price">Price</th>
              <th class="total">Toal</th>
            </tr>
            <tr
                class="table-items flex"
                v-for="(item, index) in invoiceItemList"
                :key="index"
            >
              <td class="item-name">
                <input type="text" v-model="item.itemName"/>
              </td>
              <td class="qty"><input type="text" v-model="item.qty"/></td>
              <td class="price"><input type="text" v-model="item.price"/></td>
              <td class="total flex">
                ${{ (item.total = item.qty * item.price) }}
              </td>
              <img
                  @click="deleteInvoiceItem(item.id)"
                  src="@/assets/icon-delete.svg"
                  alt=""
              />
            </tr>
          </table>

          <div @click="addNewInvoiceItem" class="flex button">
            <img src="@/assets/icon-plus.svg" alt=""/>
            Add New Item
          </div>
        </div>
      </div>
      <!-- Save/Exit -->
      <div class="save flex">
        <div class="left">
          <button type="button" @click="closeInvoice" class="red">
            Cancel
          </button>
        </div>
        <div class="right flex">
          <button v-if="!editInvoice" type="submit" @click="saveDraft" class="dark-purple">
            Save Draft
          </button>
          <button v-if="!editInvoice" type="submit" @click="publishInvoice" class="purple">
            Create Invoice
          </button>
          <button v-if="editInvoice" type="submit" class="purple">
            Update Invoice
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import {reactive, toRefs, watch, ref, computed} from "vue";
import {useStore} from "vuex";
import {uid} from "uid";
import {invoicsCollectionRef, addDoc ,updateDoc,  doc} from "../firebase/firebaseInit";
import Loading from "./Loading.vue";
import {useRoute} from "vue-router";

export default {
  name: "InvoiceModal",
  components: {
    Loading,
  },
  setup() {
    const data = reactive({
      dateOptions: {year: "numeric", month: "short", day: "numeric"},
      docId: null,
      loading: null,
      billerStreetAddress: null,
      billerCity: null,
      billerZipCode: null,
      billerCountry: null,
      clientName: null,
      clientEmail: null,
      clientStreetAddress: null,
      clientCity: null,
      clientZipCode: null,
      clientCountry: null,
      invoiceDateUnix: null,
      invoiceDate: null,
      paymentTerms: null,
      paymentDueDateUnix: null,
      paymentDueDate: null,
      productDescription: null,
      invoicePending: null,
      invoiceDraft: null,
      invoiceItemList: [],
      invoiceTotal: 0,
    });
    const store = useStore();
    const route = useRoute();
    const editInvoice = computed(() => store.state.editInvoice);
    if (!editInvoice.value) {
      data.invoiceDateUnix = Date.now();
      data.invoiceDate = new Date(data.invoiceDateUnix).toLocaleDateString(
          "en-us",
          data.dateOptions
      );
    }
    if (editInvoice.value) {
      const currentInvoice = store.state.currentInvoiceArray[0];
      data.docId = currentInvoice.docId;
      data.billerStreetAddress = currentInvoice.billerStreetAddress;
      data.billerCity = currentInvoice.billerCity;
      data.billerZipCode = currentInvoice.billerZipCode;
      data.billerCountry = currentInvoice.billerCountry;
      data.clientName = currentInvoice.clientName;
      data.clientEmail = currentInvoice.clientEmail;
      data.clientStreetAddress = currentInvoice.clientStreetAddress;
      data.clientCity = currentInvoice.clientCity;
      data.clientZipCode = currentInvoice.clientZipCode;
      data.clientCountry = currentInvoice.clientCountry;
      data.invoiceDateUnix = currentInvoice.invoiceDateUnix;
      data.invoiceDate = currentInvoice.invoiceDate;
      data.paymentTerms = currentInvoice.paymentTerms;
      data.paymentDueDateUnix = currentInvoice.paymentDueDateUnix;
      data.paymentDueDate = currentInvoice.paymentDueDate;
      data.productDescription = currentInvoice.productDescription;
      data.invoicePending = currentInvoice.invoicePending;
      data.invoiceDraft = currentInvoice.invoiceDraft;
      data.invoiceItemList = currentInvoice.invoiceItemList;
      data.invoiceTotal = currentInvoice.invoiceTotal;
    }
    const closeInvoice = () => {
      store.commit("TOGGLE_INVOICE");
      if (editInvoice.value) {
        store.commit('TOGGLE_EDIT_INVOICE')
      }
    };


    watch(
        () => data.paymentTerms,
        () => {
          const futureDate = new Date();
          data.paymentDueDateUnix = futureDate.setDate(
              futureDate.getDate() + parseInt(data.paymentTerms)
          );
          data.paymentDueDate = new Date(
              data.paymentDueDateUnix
          ).toLocaleDateString("en-us", data.dateOptions);
        }
    );
    const addNewInvoiceItem = () => {
      data.invoiceItemList.push({
        id: uid(),
        itemName: "",
        qty: "",
        price: 0,
        total: 0,
      });
    };
    const deleteInvoiceItem = (id) => {
      data.invoiceItemList = data.invoiceItemList.filter(
          (item) => item.id !== id
      );
    };
    const calInvoiceTotal = () => {
      data.invoiceTotal = 0;
      data.invoiceItemList.forEach((item) => {
        data.invoiceTotal += item.total;
      });
    };
    const publishInvoice = () => {
      data.invoicePending = true;
    };
    const saveDraft = () => {
      data.invoiceDraft = true;
    };
    const uploadInvoice = async () => {
      if (data.invoiceItemList.length <= 0) {
        alert("Please ensure you filled out work items!");
        return;
      }
      data.loading = true;
      calInvoiceTotal();
      await addDoc(invoicsCollectionRef, {
        invoiceId: uid(6),
        billerStreetAddress: data.billerStreetAddress,
        billerCity: data.billerCity,
        billerZipCode: data.billerZipCode,
        billerCountry: data.billerCountry,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientStreetAddress: data.clientStreetAddress,
        clientCity: data.clientCity,
        clientZipCode: data.clientZipCode,
        clientCountry: data.clientCountry,
        invoiceDate: data.invoiceDate,
        invoiceDateUnix: data.invoiceDateUnix,
        paymentTerms: data.paymentTerms,
        paymentDueDate: data.paymentDueDate,
        paymentDueDateUnix: data.paymentDueDateUnix,
        productDescription: data.productDescription,
        invoiceItemList: data.invoiceItemList,
        invoiceTotal: data.invoiceTotal,
        invoicePending: data.invoicePending,
        invoiceDraft: data.invoiceDraft,
        invoicePaid: null,
      });
      data.loading = false;
      closeInvoice();
      store.dispatch('GET_INVOICES');
    };
    const UPDATE_INVOICE = (d) => store.dispatch('UPDATE_INVOICE',d);
    const updateInvoice = async () => {
      if (data.invoiceItemList.length <= 0) {
        alert("Please ensure you filled out work items!");
        return;
      }
      data.loading = true;
      calInvoiceTotal();
      const dataBase = doc(invoicsCollectionRef,data.docId);
      await updateDoc(dataBase, {
        billerStreetAddress: data.billerStreetAddress,
        billerCity: data.billerCity,
        billerZipCode: data.billerZipCode,
        billerCountry: data.billerCountry,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientStreetAddress: data.clientStreetAddress,
        clientCity: data.clientCity,
        clientZipCode: data.clientZipCode,
        clientCountry: data.clientCountry,
        paymentTerms: data.paymentTerms,
        paymentDueDate: data.paymentDueDate,
        paymentDueDateUnix: data.paymentDueDateUnix,
        productDescription: data.productDescription,
        invoiceItemList: data.invoiceItemList,
        invoiceTotal: data.invoiceTotal,
      });
      data.loading = false;
      const info = {
        docId: data.docId,
        routeId: route.params.invoiceId,
      };
      UPDATE_INVOICE(info);
    }
    const submitForm = () => {
      if (editInvoice.value) {
        updateInvoice();
        return;
      }
      uploadInvoice();
    };
    const invoiceWrap = ref(null);
    const checkClick = (e) => {
      if (e.target === invoiceWrap.value) {
        store.commit("TOGGLE_MODAL");
      }
    };

    return {
      ...toRefs(data),
      closeInvoice,
      addNewInvoiceItem,
      deleteInvoiceItem,
      publishInvoice,
      saveDraft,
      submitForm,
      checkClick,
      invoiceWrap,
      editInvoice
    };
  },
};
</script>

<style lang="scss" scoped>
.invoice-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 900px) {
    left: 90px;
  }

  .invoice-content {
    position: relative;
    padding: 56px;
    max-width: 700px;
    width: 100%;
    background-color: #141625;
    color: #fff;
    box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

    h1 {
      margin-bottom: 48px;
      color: #fff;
    }

    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      color: #777f98;
    }

    h4 {
      color: #7c5dfa;
      font-size: 12px;
      margin-bottom: 24px;
    }

    // Bill To / Bill From
    .bill-to,
    .bill-from {
      margin-bottom: 48px;

      .location-details {
        gap: 16px;

        div {
          flex: 1;
        }
      }
    }

    // Invoice Work
    .invoice-work {
      .payment {
        gap: 24px;

        div {
          flex: 1;
        }
      }

      .work-items {
        .item-list {
          width: 100%;
          // Item Table Styling
          .table-heading,
          .table-items {
            gap: 16px;
            font-size: 12px;

            .item-name {
              flex-basis: 50%;
            }

            .qty {
              flex-basis: 10%;
            }

            .price {
              flex-basis: 20%;
            }

            .total {
              flex-basis: 20%;
              align-self: center;
            }
          }

          .table-heading {
            margin-bottom: 16px;

            th {
              text-align: left;
            }
          }

          .table-items {
            position: relative;
            margin-bottom: 24px;

            img {
              position: absolute;
              top: 15px;
              right: 0;
              width: 12px;
              height: 16px;
              cursor: pointer;
            }
          }
        }

        .button {
          color: #fff;
          background-color: #252945;
          align-items: center;
          justify-content: center;
          width: 100%;

          img {
            margin-right: 4px;
          }
        }
      }
    }

    .save {
      margin-top: 60px;

      div {
        flex: 1;
      }

      .right {
        justify-content: flex-end;
      }
    }
  }

  .input {
    margin-bottom: 24px;
  }

  label {
    font-size: 12px;
    margin-bottom: 6px;
  }

  input,
  select {
    width: 100%;
    background-color: #1e2139;
    color: #fff;
    border-radius: 4px;
    padding: 12px 11px;
    border: none;

    &:focus {
      outline: none;
    }
  }
}
</style>
