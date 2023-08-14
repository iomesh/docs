---
id: setup-iomesh
title: Set Up IOMesh
sidebar_label: Set Up IOMesh
---

After IOMesh is installed, you should mount the block devices, which are the disks on the Kubernetes worker nodes, to the IOMesh cluster so that IOMesh can use them to provide storage.

## View Block Device Objects 
In IOMesh, an individual block device can be viewed as a block device object. To mount block devices on IOMesh, you first need to know which block device objects are available for use. 

IOMesh manages disks on Kubernetes worker nodes with OpenEBS [node-disk-manager(NDM)](https://github.com/openebs/node-disk-manager). When deploying IOMesh, BlockDevice CR will be created in the same NameSpace as the IOMesh cluster, and you can see block devices available for use in this NameSpace.

**Procedure**

1. Get block devices in the namespace `iomesh-system`.

    ```bash
    kubectl --namespace iomesh-system -o wide get blockdevice
    ```

   If successful, you should see output like this:

    ```output
    NAME                                           NODENAME             PATH         FSTYPE   SIZE             CLAIMSTATE   STATUS   AGE
    blockdevice-648c1fffeab61e985aa0f8914278e9d0   iomesh-node-17-19    /dev/sda1    ext4     16000900661248   Unclaimed    Active   92d
    blockdevice-648c1fffeab61e985aa0f8914278e9d0   iomesh-node-17-19    /dev/sdb              16000900661248   Unclaimed    Active   92d
    blockdevice-f26f5b30099c20b1f6e993675614c301   iomesh-node-17-18    /dev/sdb              16000900661248   Unclaimed    Active   92d
    blockdevice-8b697bad8a194069fbfd544e6db2ddb8   iomesh-node-17-19    /dev/sdc              16000900661248   Unclaimed    Active   92d
    blockdevice-a3579a64869f799a623d3be86dce7c59   iomesh-node-17-18    /dev/sdc              16000900661248   Unclaimed    Active   92d
    ```
 
    > _NOTE:_
    > The field `FSTYPE` of each IOMesh block device should be blank.

    > _NOTE:_
    > The status of a block device will only be updated when the disk is unplugged. Therefore, if a disk is partitioned or formatted, its status will not be immediately updated. To update information about disk  partitioning and formatting, run the command `kubectl delete pod -n iomesh-system -l app=openebs-ndm` to restart the NDM pod, which will trigger a disk scan.
    
2. View the details of a specific block device object. Make sure to replace `<block_device_name>` with the block device name. 

    ```shell
    kubectl --namespace iomesh-system -o yaml get blockdevice <block_device_name>
    ```

    If successful, you should see output like this:
    ```output
    apiVersion: openebs.io/v1alpha1
    kind: BlockDevice
    metadata:
      annotations:
        internal.openebs.io/uuid-scheme: gpt
      generation: 1
      labels:
        iomesh.com/bd-devicePath: dev.sdb
        iomesh.com/bd-deviceType: disk
        iomesh.com/bd-driverType: SSD
        iomesh.com/bd-serial: 24da000347e1e4a9
        iomesh.com/bd-vendor: ATA
        kubernetes.io/hostname: iomesh-node-17-19
        ndm.io/blockdevice-type: blockdevice
        ndm.io/managed: "true"
      namespace: iomesh-system
      name: blockdevice-648c1fffeab61e985aa0f8914278e9d0
    # ...
    ```
    Labels with `iomesh.com/bd-` are created by IOMesh and will be used for the device selector.
    
    | Label | Description |
    | --- | --- |
    | `iomesh.com/bd-devicePath` | Shows the device path on the worker node.|
    | `iomesh.com/bd-deviceType` | Shows if it is a disk or a partition.|
    | `iomesh.com/bd-driverType` | Shows the disk type, incluing SSD and HDD.|
    | `iomesh.com/bd-serial` | Shows the disk serial number.|
    | `iomesh.com/bd-vendor` | Shows the disk vendor.|

## Configure DeviceMap

Before configuring device map, familiarize yourself with the mount type and device selector. 

**Mount Type**
|Mode|Mount Type|
|---|---|
|`hybridFlash`|Must configure `cacheWithJournal` and `dataStore`.  <ur><li>`cacheWithJournal` serves the performance layer of storage pool and **MUST** be a partitionable block device with a capacity greater than 60 GB. Two partitions will be created: one for journal and the other for cache. Either SATA or NVMe SSD is recommended.</li><li>`dataStore` is used for the capacity layer of storage pool. Either SATA or SAS HDD is recommended.</li></ur>|
|`allflash`|<p>Only need to configure `dataStoreWithJournal`. </p> `dataStoreWithJournal` is used for the capacity layer of storage pool. It **MUST** be a partitionable block device with a capacity greater than 60 GB. Two partitions will be created: one for `journal` and the other for `dataStore`. Either SATA or NVMe SSD is recommended.|

**Device Selector**
|Parameter|Value|Description|
|---|---|---|
|<code>selector</code> | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | The label selector to filter block devices.              |
|<code>exclude</code>|[block-device-name]| The block device to be excluded. |

For more information, refer to [Kubernetes Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/).


**Procedure**
1. Edit `iomesh.yaml`, the default configuration file exported during IOMesh installation.

    ```bash
    kubectl edit --namespace iomesh-system iomesh 
    ```
   
   After running the command, locate `chunk` in the file as shown below:
    ```yaml 
    spec:
      chunk:
    ```
2. Configure `deviceMap`. Specifically, copy and paste the `deviceMap` content from the following sample code and fill in fields `mount-type`, `matchLabels` or `matchExpressions`, and `exclude` based on your deployment mode and block device information. Label information `<label-key>` and `<label-value>` can be obtained from Step 2 in [View Block Device Objects](#view-block-device-objects).
    > _NOTE:_ The field `FSTYPE` of each IOMesh block device should be blank. Make sure to exclude the block device that has a specified filesystem.

    > _NOTE:_ It is recommended not to use disk names like `/dev/sdx` directly as filtering conditions in the `deviceMap` in a testing environment because disk names may change. In a production environment, it is strictly prohibited to use disk names in the  `deviceMap`.
    
    ```yaml 
    spec:
      chunk:
        deviceMap:
          <mount-type>:
            selector:
              matchLabels:
                <label-key>: <label-value> # Enter key and value as needed.
              matchExpressions:
              - key: <label-key> 
                operator: In
                Values:
                - <label-value>
            exclude:
            - <block-device-name> # Enter the block device name to exclude it.
    ```
3. Verify that the `CLAIMSTATE` of the block devices you select becomes `Claimed`.

    ```bash
    kubectl --namespace iomesh-system -o wide get blockdevice
    ```

    If successful, you should see output like this:

    ```output
    NAME                                           NODENAME             PATH         FSTYPE   SIZE             CLAIMSTATE   STATUS   AGE
    blockdevice-f001933979aa613a9c32e552d05a704a   iomesh-node-17-19    /dev/sda1    ext4     16000900661248   Unclaimed    Active   92d
    blockdevice-648c1fffeab61e985aa0f8914278e9d0   iomesh-node-17-19    /dev/sdb              16000900661248   Claimed      Active   92d
    blockdevice-f26f5b30099c20b1f6e993675614c301   iomesh-node-17-18    /dev/sdb              16000900661248   Claimed      Active   92d
    blockdevice-8b697bad8a194069fbfd544e6db2ddb8   iomesh-node-17-19    /dev/sdc              16000900661248   Claimed      Active   92d
    blockdevice-a3579a64869f799a623d3be86dce7c59   iomesh-node-17-18    /dev/sdc              16000900661248   Claimed      Active   92d
    blockdevice-a6652946c90d5c3fca5ca452aac5b826   iomesh-node-17-18    /dev/sdd              16000900661248   Unclaimed    Active   92d
    ```

**`deviceMap` Examples**

Below are three `deviceMap` examples based on all-flash and hybrid-flash deployment modes. Assuming a Kubernetes cluster has six block devices, the details are as follows:

```output
NAME                                           NODENAME             PATH         FSTYPE   SIZE             CLAIMSTATE   STATUS   AGE
blockdevice-f001933979aa613a9c32e552d05a704a   iomesh-node-17-19    /dev/sda1    ext4     16000900661248   Unclaimed    Active   92d
blockdevice-648c1fffeab61e985aa0f8914278e9d0   iomesh-node-17-19    /dev/sdb              16000900661248   Unclaimed    Active   92d
blockdevice-f26f5b30099c20b1f6e993675614c301   iomesh-node-17-18    /dev/sdb              16000900661248   Unclaimed    Active   92d
blockdevice-8b697bad8a194069fbfd544e6db2ddb8   iomesh-node-17-19    /dev/sdc              16000900661248   Unclaimed    Active   92d
blockdevice-a3579a64869f799a623d3be86dce7c59   iomesh-node-17-18    /dev/sdc              16000900661248   Unclaimed    Active   92d
blockdevice-a6652946c90d5c3fca5ca452aac5b826   iomesh-node-17-18    /dev/sdd              16000900661248   Unclaimed    Active   92d
```

You can filter the block devices to be used in IOMesh based on the labels of the block devices.

**Example 1: Hybrid Configuration `deviceMap`**

In this example, all SSD disks in the Kubernetes cluster are used as `cacheWithJournal`, and all HDD disks are used as `dataStore`. The block device `blockdevice-a6652946c90d5c3fca5ca452aac5b826` is excluded from the selection.

```yaml
spec:
  # ...
  chunk:
    # ...
    deviceMap:
      cacheWithJournal:
	selector:
	  matchLabels:
	    iomesh.com/bd-deviceType: disk
	  matchExpressions:
	  - key: iomesh.com/bd-driverType
	    operator: In
	    values:
	    - SSD
	exclude:
	- blockdevice-a6652946c90d5c3fca5ca452aac5b826
      dataStore:
	selector:
	  matchExpressions:
	  - key: iomesh.com/bd-driverType
	    operator: In
	    values:
	    - HDD
	exclude:
	- blockdevice-a6652946c90d5c3fca5ca452aac5b826
    # ...
```
Note that after the configuration is complete, any additional SSD or HDD disks added to the nodes later will be immediately managed by IOMesh. If you do not want this automatic management behavior, refer to **Example 2: Hybrid Configuration `deviceMap`**.

**Example 2: Hybrid Configuration `deviceMap`**

In this example, the block devices located at the `/dev/sdb` path in the Kubernetes cluster are used as `cacheWithJournal`, and the block devices located at the `/dev/sdc` path are used as `dataStore`.

Based on the information of the block devices provided above, the block devices under the `/dev/sdb` and `/dev/sdc` paths are as follows:

Block devices under `/dev/sdb` path:
- `blockdevice-648c1fffeab61e985aa0f8914278e9d0` 
- `blockdevice-f26f5b30099c20b1f6e993675614c301`

Block devices under `/dev/sdc` path:
- `blockdevice-8b697bad8a194069fbfd544e6db2ddb8`
- `blockdevice-a3579a64869f799a623d3be86dce7c59`

1. Run the following commands to create a custom label for the block devices under the `/dev/sdb` path in the Kubernetes cluster. `mountType` is the key of the label, and `cacheWithJournal` is the value of the label.
    ```shell
    kubectl label blockdevice blockdevice-648c1fffeab61e985aa0f8914278e9d0 mountType=cacheWithJournal -n iomesh-system
    kubectl label blockdevice blockdevice-f26f5b30099c20b1f6e993675614c301 mountType=cacheWithJournal -n iomesh-system
    ```

2. Run the following commands to create a custom label for the block devices under the `/dev/sdc` path in the Kubernetes cluster. `mountType` is the key of the label, and `dataStore` is the value of the label.

    ```shell
    kubectl label blockdevice blockdevice-8b697bad8a194069fbfd544e6db2ddb8 mountType=dataStore -n iomesh-system
    kubectl label blockdevice blockdevice-a3579a64869f799a623d3be86dce7c59 mountType=dataStore -n iomesh-system
    ```

After the labels are created, the configuration of `deviceMap` is as follows:
```yaml
spec:
  # ...
  chunk:
    # ...
    deviceMap:
      cacheWithJournal:
	selector:
	  matchExpressions:
	  - key: mountType
	    operator: In
	    values:
	    - cacheWithJournal
      dataStore:
	selector:
	  matchExpressions:
	  - key: mountType
	    operator: In
	    values:
	    - dataStore
    # ...
```

**Example 3: All-Flash Configuration `deviceMap`**

In this example, all SSD disks in the Kubernetes cluster are used as `dataStoreWithJournal`. The block device `blockdevice-a6652946c90d5c3fca5ca452aac5b826` is excluded from the selection.
```yaml
spec:
# ...
chunk:
  # ...
  deviceMap:
    dataStoreWithJournal:
      selector:
	matchLabels:
	  iomesh.com/bd-deviceType: disk
	matchExpressions:
	- key: iomesh.com/bd-driverType
	  operator: In
	  values:
	  - SSD
      exclude:
      - blockdevice-a6652946c90d5c3fca5ca452aac5b826
  # ...
```
Note that after the configuration is complete, any additional SSD or HDD disks added to the nodes later will be immediately managed by IOMesh. If you do not want this automatic management behavior, refer to **Example 2: Hybrid Configuration `deviceMap`**.




















    