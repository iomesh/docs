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
    NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
    blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   10m
    blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Unclaimed    Active   10m
    blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Unclaimed    Active   10m
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
        iomesh.com/bd-devicePath: dev.sda
        iomesh.com/bd-deviceType: disk
        iomesh.com/bd-driverType: SSD
        iomesh.com/bd-serial: 24da000347e1e4a9
        iomesh.com/bd-vendor: ATA
        kubernetes.io/hostname: kind-control-plane
        ndm.io/blockdevice-type: blockdevice
        ndm.io/managed: "true"
      namespace: iomesh-system
      name: blockdevice-3fa2e2cb7e49bc96f4ed09209644382e
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
|`hybridFlash`|You must configure 2 mount types: `cacheWithJournal` and `dataStore`.  <ur><li>`cacheWithJournal` serves the performance layer of storage pool and **MUST** be a partitionable block device with a capacity greater than 60 GB. 2 partitions will be created: one for journal and the other for cache. Either SATA or NVMe SSD is recommended.</li><li>`dataStore` is used for the capacity layer of storage pool. Either SATA or SAS HDD is recommended.</li></ur>|
|`allflash`|<p>You only need to configure 1 mount type: `dataStoreWithJournal`. </p> `dataStoreWithJournal` is used for the capacity layer of storage pool. It **MUST** be a partitionable block device with a capacity greater than 60 GB. 2 partitions will be created: one for `journal` and the other for `dataStore`. Either `SATA` or `NVMe SSD` is recommended.|

**Device Selector**
|Parameter|Value|Description|
|---|---|---|
|<code>selector</code> | [metav1.LabelSelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.20/#labelselector-v1-meta) | The label selector to filter block devices.              |
|<code>exclude</code>|[block-device-name]| The block device to be excluded from being mounted. |

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
2. Copy and paste `deviceMap` contents from the following sample code. Fill in `mount-type` according to the deployment mode and configure `matchLabels` or `matchExpressions` and `exclude`. 

    For the labels, you only need to choose one of the two fields `matchLabels` or `matchExpressions` to fill in. To know the keys and values of the block device, refer to Step 2 in [View Block Device Objects](#view-block-device-objects).
    > _NOTE:_ The field `FSTYPE` of each IOMesh block device should be blank. Make sure to exclude the block device that has a specified filesystem.
    
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
    If the deployment mode is `hybrid`, refer to the following example:

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
            - blockdevice-097b6628acdcd83a2fc6a5fc9c301e01
          dataStore:
            selector:
              matchExpressions:
              - key: iomesh.com/bd-driverType
                operator: In
                values:
                - HDD
            exclude:
            - blockdevice-097b6628acdcd83a2fc6a5fc9c301e01
        # ...
    ```

    If the deployment mode is `allflash`, refer to the following example:
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
            - blockdevice-097b6628acdcd83a2fc6a5fc9c301e01
        # ...
    ```

    Once configured, block devices filtered out will be mounted on the IOMesh cluster.

3. Verify that the `CLAIMSTATE` of the block devices you select becomes `Claimed`.

    ```bash
    kubectl --namespace iomesh-system -o wide get blockdevice
    ```

    If successful, you should see output like this:

    ```output
    NAME                                           NODENAME             PATH         FSTYPE   SIZE           CLAIMSTATE   STATUS   AGE
    blockdevice-097b6628acdcd83a2fc6a5fc9c301e01   kind-control-plane   /dev/vdb1    ext4     107373116928   Unclaimed    Active   11m
    blockdevice-3fa2e2cb7e49bc96f4ed09209644382e   kind-control-plane   /dev/sda              9659464192     Claimed      Active   11m
    blockdevice-f4681681be66411f226d1b6a690270c0   kind-control-plane   /dev/sdb              1073742336     Claimed      Active   11m
    ```
