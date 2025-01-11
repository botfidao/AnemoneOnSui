# AnemoneOnSui
The Anemone Framework is designed to introduce the concept of "cultivation-based AI agents" on the Sui network, focusing on the following core objectives:


1. Framework Objectives
The Anemone Framework is designed to introduce the concept of "cultivation-based AI agents" on the Sui network, focusing on the following core objectives:
Exploring Yield Aggregation and Asset Management based on the Sui blockchain.
Introducing a "Role Development" Mechanism: Allow users to activate, grow, and make decisions with roles, gamifying the asset management experience.
Enabling AI-Agent Operations: Automatically track user behavior, recommend investment strategies, and support transactional interactions.
Use Case Application: As a first implementation case, explore the practical value of the Little π concept.

2. Core Module Design
The core modules of the Anemone Framework include:
2.1 Role Object (Object) Definition
The framework designs role objects similar to game characters with the following core attributes:
Health Points (HP): Defines the lifecycle of a role, supporting the following options:
Temporarily inactive after depletion, requiring recharging to recover.
Permanent death after depletion, with no possibility of revival.
Special States: Transform into "Soul Form" or other specific states.
Roles now remain healthy if SUI is deposited, and their health decreases by 1 per epoch without deposits. If inactive for 100 epochs, the role becomes dormant.
Wallet Integration: Supports deposit and withdrawal operations.
Edit Permissions: Allows locking, unlocking, adding, or removing character features.
2.2 Transaction Behavior
Trading Permissions: Roles can be configured as tradable or permanently locked.
Edit Permission Transfer: After a trade, the edit permissions of a role automatically transfer to the new address.
2.3 Backend Integration
After activating roles, the system tracks user behavior with a focus on:
Yield Data Generation: Monitoring transactional gains.
Strategy Tracking: Recommending relevant strategies based on user trading patterns.
2.4 Cultivation Mechanism
Supports both single-player and multiplayer role cultivation modes, enabling joint role development and management.

3. Role Lifecycle Management
The lifecycle of a role is divided into the following stages:
3.1 Creation
Roles are minted on the Sui blockchain, with initial attribute configurations.
Edit permissions (cap) are managed by the user's wallet address.
3.2 Activation
Users need to deposit a certain amount of SUI to activate roles. The deposit must cover resource consumption.
Once activated, roles start operating, including tracking transactions, analyzing data, etc.
3.3 Operation
During its lifecycle, a role continuously tracks the user's trading behavior:
Automatically analyzes trading patterns (e.g., yield aggregation, asset conversion).
Dynamically adjusts strategies, entering or exiting yield pools as necessary.
3.4 Inactive or Dead
Inactive: Requires recharging to recover health points.
Dead: Irrecoverable, serving only as a historical record.

4. Technical Architecture
4.1 Blockchain Integration
Built on the Sui network, with roles (Objects) defined using the Move language.
Supports edit permission transfers and permanent locking functionality.
Integrates with wallets to ensure the security of deposits and withdrawals.
4.2 Backend Integration
Backend services handle data analysis and transaction strategy generation.
AI functionality integration.
4.3 Frontend Interaction
Uses Telegram Bot as the user entry point.
Provides interfaces for role activation, data input, and feature configuration.

5. Functional Workflow
5.1 Role Minting
Users access the official website via the Telegram Bot.
Connect their wallet to initialize the core attributes of the role (e.g., health points, edit permissions).
Mint role objects and complete feature configurations.
5.2 Role Activation
Deposit SUI to activate role functions.
Test to ensure all functionalities are fully operational.
5.3 Operation and Tracking
Once activated, roles track the trading behavior of user addresses.
Generate yield data based on trading patterns, recommending or executing relevant strategies.
Participate in yield pools when needed to optimize returns.
5.4 Lifecycle Management
Users can stop the role's operation at any time or extend its lifecycle by recharging.
During role trading, edit permissions automatically transfer to the new address.

6. Additional Functional Extensions
6.1 Personalized AI Learning
Little π can recommend more suitable assets or strategies based on user trading habits.
Offers Copy Trading functionality, enabling users to follow high-yield addresses directly.
6.2 Multiplayer Cultivation Mode
Supports collaborative investment and joint development of roles by multiple users.

