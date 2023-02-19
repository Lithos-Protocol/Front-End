import { isUndefined, Network } from "@fleet-sdk/common";
import { BigNumber } from "bignumber.js";

const BIG_NUMBER_IN_SHORT = Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 2
});

const SHORT_NUMBER_THRESHOLD = 1_000_000;

export function shortenString(
  val: string | undefined,
  maxLength: number | undefined,
  ellipsisPosition: "middle" | "end" = "middle"
): string {
  if (!val || !maxLength || maxLength >= val.length) {
    return val || "";
  }

  const ellipsis = "…";
  if (ellipsisPosition === "middle") {
    const fragmentSize = Math.trunc((maxLength - ellipsis.length) / 2);
    if (fragmentSize * 2 + ellipsis.length >= val.length) {
      return val;
    }

    return `${val.slice(0, fragmentSize).trimEnd()}${ellipsis}${val
      .slice(val.length - fragmentSize)
      .trimStart()}`;
  } else {
    return `${val.slice(0, maxLength - ellipsis.length + 1).trimEnd()}${ellipsis}`;
  }
}

export function formatBigNumber(number?: BigNumber, decimals?: number): string {
  if (isUndefined(number)) {
    return "0";
  }

  if (number.isGreaterThanOrEqualTo(SHORT_NUMBER_THRESHOLD)) {
    return BIG_NUMBER_IN_SHORT.format(number.toNumber());
  }

  return number.decimalPlaces(decimals || 0, BigNumber.ROUND_DOWN).toFormat({
    groupSeparator: ",",
    groupSize: 3,
    decimalSeparator: "."
  });
}

export function undecimalizeBigNumber(number: BigNumber.Instance, decimals: number) {
  return number.decimalPlaces(decimals).shiftedBy(decimals);
}

export function decimalizeBigNumber(number: BigNumber, decimals?: number): BigNumber {
  if (!decimals) {
    return number;
  }

  return number.decimalPlaces(decimals).shiftedBy(decimals * -1);
}

export function toDict<T, R, K extends string | number | symbol>(
  collection: T[],
  mapper: (item: T) => { [key in K]: R }
) {
  return Object.assign({}, ...collection.map(mapper)) as { [key in K]: R };
}

export function blockToTime(blocks: number) {
  const term = { interval: "", value: blocks * 2, blocks };
  let negative = false;

  if (term.value < 0) {
    negative = true;
    term.value *= -1;
  }

  if (term.value > 1) {
    term.value = Math.round(term.value / 1);
    term.interval = pluralize("Block", term.value);

    if (term.value > 23) {
      term.value = Math.round(term.value / 24);
      term.interval = pluralize("Block", term.value);

      if (term.value > 29) {
        term.value = Math.round(term.value / 30);
        term.interval = pluralize("Block", term.value);
      }
    }
  } else {
    term.interval = pluralize("", term.value);
  }

  if (negative) {
    term.interval += " ago";
  }

  return term;
}

export function pluralize(word: string, val: number) {
  if (val <= 1) {
    return word;
  }

  return word + "s";
}

export function getNetworkType(): Network {
  if (import.meta.env.PROD) {
    return Network.Mainnet;
  }

  return import.meta.env.VITE_NETWORK === "testnet" ? Network.Testnet : Network.Mainnet;
}
