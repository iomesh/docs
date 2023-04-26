---
id: replace-failed-disk
title: Replace Disk
sidebar_label: Replace Disk
---

You can see the health status of physical disks on the IOMesh Dashboard. If any disk is in `Unhealthy`, `Failing`, or `S.M.A.R.T not passed` state, you need to replace it with a new disk as soon as possible.

**Procedure**

1. Get the meta leader pod name.
    ```shell
    kubectl get pod -n iomesh-system -l=iomesh.com/meta-leader -o=jsonpath='{.items[0].metadata.name}'
    ```
    ```output
    iomesh-meta-0
    ```

2. Access the meta leader pod.
    ```shell
    kubectl exec -it iomesh-meta-0 -n iomesh-system -c iomesh-meta bash
    ```

3. Run the following command multiple times to verify that there are no ongoing migration or recovery tasks in the cluster. 

    Ensure that the output value is 0. If there is a field that is not 0, you need to wait for it to become 0.

    ```shell
    /opt/iomesh/iomeshctl summary cluster | egrep "recovers|migrates" 
    ```
    ```output
    num_ongoing_recovers: 0
    num_pending_recovers: 0
    num_ongoing_migrates: 0
    num_pending_migrates: 0
      pending_migrates_bytes: 0
      pending_recovers_bytes: 0
          pending_migrates_bytes: 0
          pending_recovers_bytes: 0
          pending_migrates_bytes: 0
          pending_recovers_bytes: 0
          pending_migrates_bytes: 0
          pending_recovers_bytes: 0
      num_ongoing_recovers: 0
      num_pending_recovers: 0
      num_ongoing_migrates: 0
      num_pending_migrates: 0
        pending_migrates_bytes: 0
        pending_recovers_bytes: 0
    ```

4. View the disk that needs to be replaced. Assume the disk `blockdevice-66312cce9037ae891a099ad83f44d7c9` needs to be replaced.
    ```shell
    kubectl --namespace iomesh-system get bd -o wide
    ```
    ```output
    NAME                                           NODENAME      PATH       FSTYPE   SIZE          CLAIMSTATE   STATUS   AGE
    blockdevice-41f0c2b60f5d63c677c3aca05c2981ef   qtest-k8s-0   /dev/sdc            53687091200   Unclaimed    Active   29h
    blockdevice-66312cce9037ae891a099ad83f44d7c9   qtest-k8s-1   /dev/sdc            69793218560   Claimed      Active   44h
    blockdevice-7aff82fe93fac5153b14af3c82d68856   qtest-k8s-2   /dev/sdb            69793218560   Claimed      Active   44h
    ```

5. Run the following command to edit the `deviceMap` of the disk. That is, add the disk name to the `exclude` field under `devicemap`.

    ```shell
    kubectl edit iomesh iomesh -n iomesh-system
    ```

    ```yaml
        # ...
        deviceMap:
          # ...
          dataStore:
            selector:
              matchExpressions:
              - key: iomesh.com/bd-driverType
                operator: In
                values:
                - HDD
              matchLabels:
                iomesh.com/bd-deviceType: disk
            exclude:
            - blockdevice-66312cce9037ae891a099ad83f44d7c9
      # ...
    ```

6. Repeat Step 2 and 3 to verify that there are no ongoing migration or recovery tasks for the cluster. 

7. Verify that the block device is in `unclaimed` state.
    ```shell
    kubectl get bd blockdevice-66312cce9037ae891a099ad83f44d7c9 -n iomesh-system
    ```
    ```output
    NAME                                           NODENAME      PATH       FSTYPE   SIZE          CLAIMSTATE   STATUS   AGE
    blockdevice-66312cce9037ae891a099ad83f44d7c9   qtest-k8s-1   /dev/sdc            69793218560   Unclaimed     Active  44h
    ```

8. Unplug the disk. Then the disk will enter `Inactive` state. 

   Run the following commands simultaneously to remove the block device and its corresponding `blockdeviceclaim`. 
    ```shell
    kubectl patch bdc/blockdevice-66312cce9037ae891a099ad83f44d7c9 -p '{"metadata":{"finalizers":[]}}' --type=merge -n iomesh-system
    kubectl patch bd/blockdevice-66312cce9037ae891a099ad83f44d7c9 -p '{"metadata":{"finalizers":[]}}' --type=merge -n iomesh-system
    kubectl delete bdc blockdevice-66312cce9037ae891a099ad83f44d7c9 -n iomesh-system
    kubectl delete bd blockdevice-66312cce9037ae891a099ad83f44d7c9 -n iomesh-system
    ```
9. Plug the new disk. Refer to [Set Up IOMesh](../deploy-iomesh-cluster/setup-iomesh) to mount it to the IOMesh cluster.

