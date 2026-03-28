/**
 * Abstract base class for use cases (application service orchestrators).
 *
 * Use cases coordinate multiple commands and/or queries when a single
 * operation requires more than one step. They are the application layer's
 * entry point for complex business workflows.
 *
 * When to use a Use Case vs. a single Command:
 * - **Single command**: One write operation (e.g., create a user).
 * - **Use Case**: Multiple steps that must be coordinated
 *   (e.g., place order → reserve stock → charge payment → send confirmation).
 *
 * @template TInput - The DTO/input type for the use case.
 * @template TOutput - The return type of the use case.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class PlaceOrderUseCase extends BaseUseCase<PlaceOrderDto, OrderResponseDto> {
 *   constructor(
 *     private readonly commandBus: CommandBus,
 *     private readonly queryBus: QueryBus,
 *   ) { super(); }
 *
 *   async execute(dto: PlaceOrderDto): Promise<OrderResponseDto> {
 *     const user = await this.queryBus.execute(new GetUserByIdQuery(dto.userId));
 *     const stock = await this.queryBus.execute(new CheckStockQuery(dto.items));
 *     const order = await this.commandBus.execute(new CreateOrderCommand(...));
 *     await this.commandBus.execute(new ReserveStockCommand(...));
 *     return order;
 *   }
 * }
 * ```
 */
export abstract class BaseUseCase<TInput, TOutput> {
  /**
   * Execute the use case.
   *
   * @param input - The input data (typically a DTO).
   * @returns The output data (typically a response DTO).
   */
  abstract execute(input: TInput): Promise<TOutput>;
}
