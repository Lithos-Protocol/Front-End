import { EIP12UnsignedTransaction } from "@fleet-sdk/common";
import { Amount, Box, ErgoAddress, TransactionBuilder } from "@fleet-sdk/core";
import {
  CancelOrderPlugin,
  CloseOrderPlugin,
  LiquidatePlugin,
  OpenOrderParams,
  OpenOrderPlugin,
  RepayPlugin
} from "./plugins";
import { MIN_FEE } from "@/constants";
import { useChainStore, useWalletStore } from "@/stories";

export class TransactionFactory {
  public static async openOrder(order: Omit<OpenOrderParams, "borrower">) {
    const { chain, changeAddress, inputs, wallet } = await this._getTxContext();

    const unsignedTx = new TransactionBuilder(chain.height)
      .from(inputs)
      .extend(OpenOrderPlugin({ ...order, borrower: changeAddress }))
      .payFee(MIN_FEE)
      .sendChangeTo(changeAddress)
      .build("EIP-12");

    return await this._signAndSend(unsignedTx, wallet);
  }

  public static async cancelOrder(box: Box<Amount>) {
    const { chain, changeAddress, inputs, wallet } = await this._getTxContext();
    const unsignedTx = new TransactionBuilder(chain.height)
      .from(inputs)
      .extend(CancelOrderPlugin(box, changeAddress))
      .payFee(MIN_FEE)
      .sendChangeTo(changeAddress)
      .build("EIP-12");

    return await this._signAndSend(unsignedTx, wallet);
  }

  public static async closeOrder(orderBox: Box<Amount>) {
    const { chain, changeAddress, inputs, wallet } = await this._getTxContext();

    const implementor = ErgoAddress.fromBase58(
      "9gzUxbd4GoqCaYEbhzdqj4HEA7BzdjJMH8nQiTVfoDKTvJQf68H"
    );

    const unsignedTx = new TransactionBuilder(chain.height)
      .from(inputs)
      .extend(
        CloseOrderPlugin(orderBox, {
          currentHeight: chain.height,
          lender: changeAddress,
          uiImplementor: implementor
        })
      )
      .payFee(MIN_FEE)
      .sendChangeTo(changeAddress)
      .build("EIP-12");

    return await this._signAndSend(unsignedTx, wallet);
  }

  public static async liquidate(box: Box<Amount>) {
    const { chain, changeAddress, inputs, wallet } = await this._getTxContext();

    const unsignedTx = new TransactionBuilder(chain.height)
      .from(inputs)
      .extend(LiquidatePlugin(box, changeAddress))
      .payFee(MIN_FEE)
      .sendChangeTo(changeAddress)
      .build("EIP-12");

    return await this._signAndSend(unsignedTx, wallet);
  }

  public static async repay(box: Box<Amount>) {
    const { chain, changeAddress, inputs, wallet } = await this._getTxContext();

    const unsignedTx = new TransactionBuilder(chain.height)
      .from(inputs)
      .extend(RepayPlugin(box))
      .payFee(MIN_FEE)
      .sendChangeTo(changeAddress)
      .build("EIP-12");

    return await this._signAndSend(unsignedTx, wallet);
  }

  private static async _getTxContext() {
    const chain = useChainStore();
    const wallet = useWalletStore();

    const inputs = await wallet.getBoxes();
    const changeAddress = ErgoAddress.fromBase58(await wallet.getChangeAddress());

    return { inputs, changeAddress, chain, wallet };
  }

  private static async _signAndSend(
    unsignedTx: EIP12UnsignedTransaction,
    wallet: ReturnType<typeof useWalletStore>
  ) {
    const signedTx = await wallet.signTx(unsignedTx);

    return await wallet.submitTx(signedTx);
  }
}
