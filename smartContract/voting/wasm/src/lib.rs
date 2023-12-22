// Code generated by the multiversx-sc build system. DO NOT EDIT.

////////////////////////////////////////////////////
////////////////// AUTO-GENERATED //////////////////
////////////////////////////////////////////////////

// Init:                                 1
// Endpoints:                            9
// Async Callback (empty):               1
// Total number of exported functions:  11

#![no_std]

// Configuration that works with rustc < 1.73.0.
// TODO: Recommended rustc version: 1.73.0 or newer.
#![feature(lang_items)]

multiversx_sc_wasm_adapter::allocator!();
multiversx_sc_wasm_adapter::panic_handler!();

multiversx_sc_wasm_adapter::endpoints! {
    voting
    (
        init => init
        upgrade => upgrade
        set_values => set_values
        vote => vote
        calculate_result => calculate_result
        getDeadline => deadline
        getNumberOfOptions => number_of_options
        getNames => names
        getParticipants => participants
        getStatus => voting_status
    )
}

multiversx_sc_wasm_adapter::async_callback_empty! {}
