
BoardApp = {
  key: 'ckey_9014ae23814045cdb2d7896827e',
  owner: '0x5DD27C54ed89224db4Ca723383f8F26E1de2d9fF',

  init: function() {
    return BoardApp.getData();
  },

  getData: function() {
    var address = $("#address").val();
    $("#address").val(BoardApp.owner);
    //if (address) {
    if (1) {
      $.ajax({
        url: 'https://api.covalenthq.com/v1/56/address/' + BoardApp.owner + '/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=true&key=' + BoardApp.key,
        beforeSend: function(xhr) {
        }, 
        success: function(data){        
          var no_nft = data.data.items.filter(item => item.type != "nft");
          var marker_data = no_nft.map(item => ({ 
            "Asset": "<img src='" + item.logo_url + "' width='28px' />" + item.contract_name,           
            "Symbol": item.contract_ticker_symbol,           
            "Contract Address": item.contract_address,           
            "Quantity": item.quote_rate ? item.quote / item.quote_rate : 0,           
            "Price": item.quote_rate,              
            "Value": item.quote,            
          }));
          $('#data-table').dataTable().fnClearTable();
          if (marker_data.length)
            $('#data-table').dataTable().fnAddData(marker_data);        
                
          var nft = data.data.items.filter(item => item.type == "nft");
          var nft_datas = new Array();
          nft.forEach(item => { 
            if (item.nft_data) {
              item.nft_data.forEach(nft_item => {
                nft_datas.push({
                "Token": item.contract_name,           
                "Type": item.supports_erc,           
                "Token ID": nft_item.token_id,              
                });
              });
            }
          });
          $('#data-table-nft').dataTable().fnClearTable();
          if (nft_datas.length)
            $('#data-table-nft').dataTable().fnAddData(nft_datas);        
        }
      })
    }
  }
};

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        
      }
    });

    //j=0;
    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.proposalsCount();
    }).then(function(proposalsCount) {
      var proposalsResults = $("#proposalsResults");
      proposalsResults.empty();

      var proposalsSelect = $('#proposalsSelect');
      proposalsSelect.empty();

      
      //if (j < 1){
        for (var i = 1; i <= proposalsCount; i++) {
          electionInstance.proposals(i).then(function(proposal) {
            var id = proposal[0];
            var name = proposal[1];
            var voteCount = proposal[2];

            // Render proposal Result

            var proposalTemplate = "<tr><td>" + id + "</td><td>" + name + "</td><td>" + voteCount + "</td></tr>"
            proposalsResults.append(proposalTemplate);

            // Render proposal ballot option
            var proposalOption = "<option value='" + id + "' >" + name + "</ option>"
            proposalsSelect.append(proposalOption);
          });
        }
        //j++; 
      //}
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var proposalId = $('#proposalsSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(proposalId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  initMetaMask: function() {
    function enableUser() {
        const accounts = window.ethereum.enable();
        const account = accounts[0];
        App.account = account;
    }
    enableUser();
  },
};

$(function() {
  $(window).load(function() {
    $('#data-table').DataTable({
      "columns": [
          { "data": "Asset" },
          { "data": "Symbol" },
          { "data": "Contract Address" },
          { "data": "Quantity" },
          { "data": "Price" },
          { "data": "Value" },
      ]
    });
    
    $('#data-table-nft').DataTable({
      "columns": [
          { "data": "Token" },
          { "data": "Token ID" },
          { "data": "Type" },
      ]
    });
    BoardApp.init();

    App.initMetaMask();
    App.init();
  });
});
