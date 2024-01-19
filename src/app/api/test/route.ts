import { prismaClient } from "@/src/utils/clients";
import { compareDateWithoutTime } from "@/src/utils/date-utils";
import { NextResponse } from "next/server";

export async function POST() {
  const data = await prismaClient.userQuestionTrack.findMany();
  console.log(data);
  // const data: { createdOn: Date; cast: Date }[] =
  //   await prismaClient.$queryRaw`select "createdOn", "createdOn"::date as cast from "UserQuestionTrack";`;
  // console.log(
  //   data.map(({ createdOn, cast }) =>
  //     compareDateWithoutTime(createdOn, cast, true, false)
  //   )
  // );
  // const date = new Date();
  // date.setHours(date.getHours() - 17);
  // console.log(date);
  // console.log(date.getDate());
  return NextResponse.json({});
}
