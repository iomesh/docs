---
id: localpv-manager
title: IOMesh LocalPV Manager
sidebar_label: IOMesh LocalPV Manager
---

## Introduction

### What is IOMesh LocalPV Manager

IOMesh LocalPV Manager is a CSI driver used to manage local storage on Kubernetes worker nodes. Stateful applications themselves such as [Minio](https://min.io/) and [TiDB](https://github.com/pingcap/tidb) achieve data high availability at their application layer. Persistent volumes in IOMesh however also add additional replicas in the data path due to its multi-replica policy, which may cause a degree of performance degradation and space waste. 

To avoid this issue, IOMesh LocalPV Manager offers an advantage since it allows for creating PVs using local storage like a directory or block device for pod use.

IOMesh LocalPV Manager, compared to [Kubernetes HostPath Volume](https://kubernetes.io/docs/concepts/storage/volumes/#hostpath) and [Kubernetes native local PV](https://kubernetes.io/docs/concepts/storage/volumes/#local), has the following advantages:

- Dynamically provision PVs by using StorageClass and PVC for flexible storage access, without requiring administrators to pre-provision static PVs.

- Allow for creating PVs with block devices, offering superior I/O performance and greater flexibility than Kubernetes local PVs that are limited to directories.

- Enable the capacity limit for PVs when using a directory as local storage.

### Architecture

![IOMesh LocalPV Manager](https://user-images.githubusercontent.com/12667277/230593329-0ed3b0e9-4f27-4f0f-9759-54aff0912d49.svg)

IOMesh LocalPV Manager is comprised of 3 components: Controller Driver, Node Driver, and Node Disk Manager.

**Controller Driver** 

Implemented as a standard CSI controller server. With one instance on each worker node, it interacts with `kube-apiserver` for the creation and deletion of local PVs and the mapping of PVs to local directories or block devices.

**Node Driver** 

Implemented as a standard CSI node server. With one instance on each worker node, its main task is to interact with `kubelet` to mount and format local PVs.

**Node Disk Manager**

A component for discovering block devices and transforming them to block device objects, and providing a BlockDeviceClaim to ensure that a block device is exclusive to a particular pod.

## Deployment

IOMesh LocalPV Manager is automatically installed during IOMesh installation and runs as a pod on each worker node. To see the status of the IOMesh LocalPV Manager pod, run the following command:

```shell
kubectl get pod -n iomesh-system | grep localpv-manager
```
```output
NAME                                                           READY   STATUS             RESTARTS   AGE
iomesh-localpv-manager-rjg8j                                   4/4     Running            0          10s
iomesh-localpv-manager-vphz9                                   4/4     Running            0          10s
iomesh-localpv-manager-w4j8m                                   4/4     Running            0          10s
```

## IOMesh Hostpath Local PV

IOMesh LocalPV Manager offers 2 types of volumes: `HostPath` and `Device`. With `HostPath`, you can create PVs from a local directory on a node and enable capacity limits for PVs. `Device`, on the other hand, allows creating PVs using a block device for pod use. 

When choosing between these volume types, consider whether your applications or databases require exclusive use of a disk or whether they need a raw block device. If so, choose `Device`, or else `HostPath` should suffice.

### Create HostPath Local PV

**Procedure**

1. When IOMesh LocalPV Manager is deployed, a default StorageClass will be created as shown below, with `volumeType` set to `hostPath`. 

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh-localpv-manager-hostpath
      parameters:
        volumeType: hostpath
        basePath: /var/iomesh/local
        enableQuota: "false" 
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```

    You may also create a StorageClass with custom parameters. See details in the following table and [Create StorageClass](../volume-operations/create-storageclass.md).
    | Field | Description  |
    | ------- | ---- |
    | `parameters.volumeType`  | Local PV type, either `hostpath` or `device`. Set the field to `hostpath` for the IOMesh HostPath local PV.|
    | `parameters.basePath`    | The directory on which the local PV will created. If this field is not specified, the system will create a directory by default. Note that <strong> the value for `parameters.basePath` must be a fullpath.</strong> |
    | `parameters.enableQuota` | Shows whether the capacity limit is enabled for the local PV using this StorageClass, which defaults to `false`. |
    | [`volumeBindingMode`](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode)    | Controls when volume binding and dynamic provisioning should occur. IOMesh only supports `WaitForFirstConsumer`.| 

2. Create a PVC using the StorageClass.

    - Create a YAML config `iomesh-localpv-hostpath-pvc.yaml` with the following content. 


      ```yaml
      kind: PersistentVolumeClaim
      apiVersion: v1
      metadata:
        name: iomesh-localpv-hostpath-pvc
      spec:
        storageClassName: iomesh-localpv-manager-hostpath # If you use a StorageClass with custom parameters, specify its name.
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
      ```

    - Apply the YAML config to create the PVC.
        ```shell
        kubectl apply -f iomesh-localpv-hostpath-pvc.yaml
        ```

    - View the PVC.
        ```shell
        kubectl get pvc iomesh-localpv-hostpath-pvc
        ```

        You will see the PVC in the `Pending` state because `volumeBindingMode` in its StorageClass has been configured as `WaitForFirstConsumer`. The PVC will transition to the `Bound` state only when the PVC is bound to a pod and the corresponding PV is created on the node where the pod resides.
      
        ```shell
        NAME                          STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS               AGE
        iomesh-localpv-hostpath-pvc   Pending                                      localpv-manager-hostpath   1m12s
        ```
3. Create a pod and bind it to the PVC created in Step 2.

    - Create a YAML config `iomesh-localpv-hostpath-pod.yaml` with the following content, which will mount the PVC to the `/mnt/iomesh/localpv` directory of this pod.
      ```yaml
      apiVersion: v1
      kind: Pod
      metadata:
        name: iomesh-localpv-hostpath-pod
      spec:
        volumes:
        - name: iomesh-localpv-hostpath
          persistentVolumeClaim:
            claimName: iomesh-localpv-hostpath-pvc
        containers:
        - name: busybox
          image: busybox
          command:
            - sh
            - -c
            - 'while true; do sleep 30; done;'
          volumeMounts:
          - mountPath: /mnt/iomesh/localpv
            name: iomesh-localpv-hostpath
      ```

    - Apply the YAML config to create the pod.
    
        ```shell
        kubectl apply -f iomesh-localpv-hostpath-pod.yaml
        ```

    - Verify that the pod is in the `Running` state.

        ```shell
        kubectl get pod iomesh-localpv-hostpath-pod
        ```
        
    - Verify that the PVC is in `Bound` state and its corresponding PV was created.
        ```shell
        kubectl get pvc iomesh-localpv-hostpath-pvc
        ```
        ```output
        NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES     
        iomesh-localpv-hostpath-pvc   Bound    pvc-ab61547e-1d81-4086-b4e4-632a08c6537b   2G         RWO           
        ```

    - View the PV configurations. Replace `pvc-ab61547e-1d81-4086-b4e4-632a08c6537b` with the PV name obtained above. 
        ```shell
        kubeclt get pv pvc-ab61547e-1d81-4086-b4e4-632a08c6537b -o yaml
        ```
      ```yaml
      apiVersion: v1
      kind: PersistentVolume
      metadata:
      ...
      spec:
      ...
        csi:
          driver: com.iomesh.iomesh-localpv-manager
          volumeAttributes:
            basePath: /var/iomesh/local
            csi.storage.k8s.io/pv/name: pvc-ab61547e-1d81-4086-b4e4-632a08c6537b
            csi.storage.k8s.io/pvc/name: iomesh-localpv-hostpath-pvc
            csi.storage.k8s.io/pvc/namespace: default
            enableQuota: "false"
            nodeID: iomesh-k8s-0
            quotaProjectID: "0"
            storage.kubernetes.io/csiProvisionerIdentity: 1675327643130-8081-com.iomesh.localpv-manager
            volumeType: hostpath
          volumeHandle: pvc-ab61547e-1d81-4086-b4e4-632a08c6537b
        nodeAffinity:
          required:
            nodeSelectorTerms:
            - matchExpressions:
              - key: topology.iomesh-localpv-manager.csi/node
                operator: In
                values:
                - iomesh-k8s-0
      ...
      ```

        | Field | Description  |
        | -------- | ------ |
        | `spec.csi.volumeAttributes.basePath` | `basePath` created by the IOMesh local PV. Taking the above YAML config as an example, the directory for the PV is created on  `/var/iomesh/local/pvc-ab61547e-1d81-4086-b4e4-632a08c6537b` on the node `iomesh-k8s-0`. |
        | `spec.nodeAffinity`| PV node affinity. This PV will be bound to the specified node once created and will not move to another node.|  

### Enable Capacity Limit

In the above example, an IOMesh local PV with a capacity of 2G is created, corresponding to a directory on the node. By default, there is no limit on the amount of data written to this directory, allowing more than 2G to be written. However, if you have capacity isolation requirements, you can enable the capacity limit for the IOMesh local PV.

 To use the capacity limit function with the `xfs_quota `tool, `parameters.basePath` in StorageClass should be an XFS format mount point and has the XFS `prjquota` feature enabled via the mount option. Once enabled, a local PV with `xfs quota` configured will be created to verify the declared capacity in the PVC.

**Procedure**

The following example assumes that the local PV is created on the `/var/iomesh/localpv-quota` directory, and the disk path is `/dev/sdx`. 

1. Create a directory `/var/iomesh/localpv-quota` as `basePath`.

    ```shell
    mkdir -p /var/iomesh/localpv-quota
    ```
2. Format the filesystem of the disk as `xfs`. The disk path is `/dev/sdx`.

    ```shell
    sudo mkfs.xfs /dev/sdx 
    ```
3. Mount the disk to the `/var/iomesh/localpv-quota` directory and enable XFS `prjquota` via the mount option.

    ```shell
    mount -o prjquota /dev/sdx /var/iomesh/localpv-quota
    ```
    > _NOTE_: If you want to use an existing XFS mount point as the basePath, run the command `umount /dev/sdx` to unmount the mount point first. Then remount it via the `prjquota` mount option.

    > _NOTE_: To prevent the loss of mount information after rebooting the node, you need to write the mount information to the `/etc/fstab` configuration file. 

4. Create a StorageClass using this mount point as `basePath`. Set the field `parameters.enableQuota` to `true`.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh-localpv-manager-hostpath
    parameters:
      volumeType: hostpath
      basePath: /var/iomesh/localpv-quota
      enableQuota: "true" # To enable capacity limit, set it to "true". Default value is "false".
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```

5. Create a PVC using the StorageClass created in Step 4.

    > _NOTE_: Scheduler is currently not supported in this release. The pod may be scheduled to a node with insufficient capacity. You should manually modify node affinity for this pod so that it can be rescheduled to a proper node. For modification procedure, refer to [Kubernetes Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/).

##  IOMesh Device Local PV

IOMesh Device Local PV supports creating local PVs based on a block device on the node for pod use.

### Create IOMesh Device Local PV

**Procedure**

1. When IOMesh LocalPV Manager is deployed, a default StorageClass will be created as shown below with `volumeType` set to `device`. 

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh-localpv-manager-device
    parameters:
      volumeType: device
      csi.storage.k8s.io/fstype: "ext4"
      deviceSelector: {}
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    You may also create a StorageClass with custom parameters. See details in the following table and [Create StorageClass](../volume-operations/create-storageclass.md).
    | Field  | Description   |
    | -------- | ----------- |
    | `parameters.volumeType`     | Local PV type, either `hostpath` or `device`. Set the field to `device` for the IOMesh device local PV.
    | `parameters.deviceSelector` | Device selector that filters block devices by label. If this field is not specified, then all labels will be filtered by default.|
    | `parameters.csi.storage.k8s.io/fstype ` | The filesystem type when the `volumeMode` is set to `Filesystem`, which defaults to `ext4`. |
    | `volumeBindingMode` | Controls when volume binding and dynamic provisioning should occur. IOMesh only supports `WaitForFirstConsumer`. |

2. Configure `deviceSelector`. For configuration details, refer to [`labelSelector`](../deploy-iomesh-cluster/setup-iomesh.md) and [Kubernetes Labels and Selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/).

    For example, `iomesh.com/bd-driveType: SSD` means the StorageClass will only filter SSD for creating local PVs.

    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: iomesh-localpv-manager-device-ssd
    parameters:
      volumeType: device
      deviceSelector: |
        matchLabels:
          iomesh.com/bd-driveType: SSD
    provisioner: com.iomesh.iomesh-localpv-manager
    reclaimPolicy: Delete
    volumeBindingMode: WaitForFirstConsumer
    ```
    > _NOTE_: Kubernetes only supports one-level key/value nesting when configuring `parameters` in the StorageClass , so you should add `|` to the `deviceSelector` field to identify the subsequent content as a multi-line string.

3. Create a PVC using the StorageClass.

    > _NOTE_: To ensure successful creation, make sure that each Kubernetes worker node has at least 1 available raw block device with a capacity larger than 10 G and has no filesystem specified.

    - Create a YAML config `iomesh-localpv-device-pvc.yaml` with the following content. Configure `volumeMode`, and setting this field to `filesystem` or `block` depends on the need of formatting the filesystem.

        - `Filesystem`: Access storage as a file system. Once `Filesystem` is set, the block device will be formatted as the filesystem type specified in the `parameters.fsType` field of the StorageClass and mounted to the pod after the pod is bound to this PVC.
        - `Block`: Access storage as a raw block device. It does not require formatting the filesystem and can be used directly for high-performance applications that require low latency and high bandwidth, such as databases or other storage-intensive workloads.

          ```yaml
          kind: PersistentVolumeClaim
          apiVersion: v1
          metadata:
            name: iomesh-localpv-device-pvc
          spec:
            storageClassName: iomesh-localpv-manager-device
            accessModes:
              - ReadWriteOnce
            resources:
              requests:
                storage: 10Gi
            volumeMode: Filesystem
          ```
    - Apply the YAML config to create the PVC.
        ```shell
        kubectl apply -f iomesh-localpv-device-pvc.yaml
        ```
    - View the status of the PVC.
        ```shell
        kubectl get pvc iomesh-localpv-device-pvc
        ```
       You will see the PVC in the `Pending` state because `volumeBindingMode` in its StorageClass has been configured as `WaitForFirstConsumer`. The PVC will transition to the `Bound` state only when the PVC is bound to a pod and the corresponding PV is created on the node where the pod resides.

        ```output
        NAME                          STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS               AGE
        iomesh-localpv-device-pvc     Pending                                      localpv-manager-device     1m12s
        ```

4. Create a pod and bind it to the PVC created in Step 3.

    - Create a YAML config `iomesh-localpv-device-pod.yaml` with the following content, which will mount the PV to the `/mnt/iomesh/localpv` directory.
      ```yaml
      apiVersion: v1
      kind: Pod
      metadata:
        name: iomesh-localpv-device-pod
      spec:
        volumes:
        - name: iomesh-localpv-device
          persistentVolumeClaim:
            claimName: iomesh-localpv-device-pvc
        containers:
        - name: busybox
          image: busybox
          command:
            - sh
            - -c
            - 'while true; do sleep 30; done;'
          volumeMounts:
          - mountPath: /mnt/iomesh/localpv # The directory to mount the PV.
            name: iomesh-localpv-device
      ```

   - Apply the YAML config to create the pod.
        ```shell
        kubectl apply -f iomesh-localpv-device-pod.yaml
        ```

   - Verify that the pod is in `Running` state.

        ```shell
        kubectl get pod iomesh-localpv-device-pod
        ```
        > _NOTE_: Scheduler currently is not supported in this release. The pod may be scheduled to a node that does not have available block devices. You should manually edit node affinity for this pod to reschedule it to a proper node. For modification procedure, refer to [Kubernetes Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/).

   - Verify that the PVC is in `Bound` state.
        ```shell
        kubectl get pvc iomesh-localpv-device-pvc
        ```
     If successful, you should see the PVC is in `Bound` state, and the PV was created.
        ```shell
        NAME                          STATUS   VOLUME                                     CAPACITY   ACCESS MODES     
        iomesh-localpv-device-pvc     Bound    pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4   10G         RWO           
        ```
5.  Check the status of the block device that should be in `Claimed` state.

    ```shell
    kubectl  get blockdevice --namespace iomesh-system -o wide
    ```
    ```output
    NAMESPACE       NAME                                           NODENAME            SIZE             CLAIMSTATE   STATUS   AGE
    iomesh-system   blockdevice-072560a15c89a324aadf7eb4c9b233f2   iomesh-node-17-18   1920383410176    Claimed      Active   160m
    iomesh-system   blockdevice-1189c24046a6c43da37ddf0e40b5c1de   iomesh-node-17-19   1920383410176    Claimed      Active   160m
    ```
    The block device comes from the node of the pod to which the PVC is bound and should fulfill 2 requirements: its capacity must exceed or equal that of PVC, and it must have the closest capacity to that of PVC among all available block devices. For example, if a 10-GB PVC is declared and there are 3 block devices:
    - `BlockDevice-A` with 9GB
    - `BlockDevice-B` with 15GB
    - `BlockDevice-C` with 20GB  
      
    `BlockDevice-B` is selected for binding because it has a capacity closer to 10GB than `BlockDevice-C`, and `BlockDevice-A` is excluded due to its limited capacity.


6. View the configurations of this PV. Replace `pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4` with the PV name obtained in Step 4.

    ```shell
    kubeclt get pv pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4 -o yaml
    ```
    You should see output like this:

    ```yaml
    apiVersion: v1
    kind: PersistentVolume
    metadata:
    ...
    spec:
    ...
      csi:
        driver: com.iomesh.iomesh-localpv-manager
        volumeAttributes:
          csi.storage.k8s.io/pv/name: pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4
          csi.storage.k8s.io/pvc/name: iomesh-localpv-device-pvc
          csi.storage.k8s.io/pvc/namespace: default
          nodeID: k8s-worker-2
          quotaProjectID: "0"
          storage.kubernetes.io/csiProvisionerIdentity: 1675327673777-8081-com.iomesh.localpv-manager
          volumeType: device
        volumeHandle: pvc-72f7a6ab-a9c4-4303-b9ba-683d7d9367d4
      nodeAffinity:
        required:
          nodeSelectorTerms:
          - matchExpressions:
            - key: topology.iomesh-localpv-manager.csi/node
              operator: In
              values:
              - k8s-worker-2
    ...
    ```

    | Field  | Description    |
    | ----- | ------- |
    | `spec.csi.volumeAttributes.volumeHandle` | The unique identifier of the BlockDeviceClaim.|
    | `spec.nodeAffinity` | PV node affinity. The PV will be bound to the specified node once created and will not move to another node. |

